import { FileService } from "../../../../shared/infra/services/file.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generateGenId } from "../../../../shared/utils/generate-gen-id";
import { sendEmail } from "../../../../shared/utils/send-email";
import { IVmOutRepository } from "../../domain/repositories/vm-out.repository";
import { generateNormalizedPhonePT } from "../../../../shared/utils/generate-normalized-phone";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { AltitudeAuthService } from "../../../../shared/infra/providers/altitude/auth.service";

export class VmOutUseCase {
  constructor(
    private fileService: FileService,
    private vmOutRepository: IVmOutRepository,
  ) {}

  private readonly CONTACT_LIST = "Out teste";
  private readonly CAMPAIGN = "VM_OUT";

  private buildField(Name: string, Value: any) {
    if (Name === "MobilePhone" || Name === "HomePhone") {
      Value = String(Value ?? "").slice(-9);
    }

    return {
      discriminator: "DatabaseFields",
      Name,
      Value: Value ?? "",
      IsAnonymized: false,
    };
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async execute() {
    const executionDate = new Date();
    const dataload = generateDataload();

    const folder = "\\\\hercules\\Supervisao\\Campanhas\\rerun_natura";
    const fileName = "carregar.csv";
    const filePath = `${folder}\\${fileName}`;

    const exists = await this.fileService.exists(filePath);

    if (!exists) {
      return await sendEmail({
        to: [
          "ryan.martins@pluricall.pt",
          "margarida.raposo@pluricall.pt",
          "rita.carvalho@pluricall.pt",
          "raul.neto@pluricall.pt",
          "jorge.rodrigues@pluricall.pt",
          "beatriz.contreras@pluricall.pt",
          "susana.silva@pluricall.pt",
          "nuno.rainha@pluricall.pt",
        ],
        subject: `VM OUT - ficheiro não encontrado ${new Date().toLocaleString("pt-PT")} `,
        html: `Processo executado às ${new Date().toLocaleString("pt-PT")} sem ficheiro.`,
      });
    }

    const rows = await this.fileService.parseCSV(filePath);

    if (!rows.length) {
      return await sendEmail({
        to: [
          "ryan.martins@pluricall.pt",
          "margarida.raposo@pluricall.pt",
          "rita.carvalho@pluricall.pt",
          "raul.neto@pluricall.pt",
          "jorge.rodrigues@pluricall.pt",
          "beatriz.contreras@pluricall.pt",
          "susana.silva@pluricall.pt",
          "nuno.rainha@pluricall.pt",
        ],
        subject: `VM OUT - ficheiro vazio ${new Date().toLocaleString("pt-PT")} `,
        html: `Ficheiro encontrado mas sem dados.`,
      });
    }

    const leads = rows
      .filter((r) => Object.values(r)[0])
      .map((r) => ({
        phone: generateNormalizedPhonePT(Object.values(r)[0]),
        calls: Number(String(Object.values(r)[1] || 0).trim()),
        lastCall: String(Object.values(r)[2]),
        executionDate,
      }));

    const blacklist = await this.vmOutRepository.getBlacklist();
    const attendedToday = await this.vmOutRepository.getAttendedToday();

    const blacklistSet = new Set(blacklist);
    const alreadyLoaded = new Set(attendedToday);

    const uniqueLeadsMap = new Map<string, (typeof leads)[0]>();

    for (const lead of leads) {
      if (!uniqueLeadsMap.has(lead.phone)) {
        uniqueLeadsMap.set(lead.phone, lead);
      }
    }

    const uniqueLeads = Array.from(uniqueLeadsMap.values());

    const finalLeads = uniqueLeads
      .filter((l) => !alreadyLoaded.has(l.phone))
      .filter((l) => !blacklistSet.has(l.phone));

    const altitudeCreateContact = new AltitudeCreateContact(
      new AltitudeAuthService(),
    );

    const executionId = crypto.randomUUID();
    for (const lead of finalLeads) {
      const genId = generateGenId();
      let status = "PENDING";
      let reason = "";

      if (blacklistSet.has(lead.phone)) {
        status = "FILTERED";
        reason = "BLACKLIST";
      } else if (alreadyLoaded.has(lead.phone)) {
        status = "FILTERED";
        reason = "ATTENDED";
      }

      try {
        await this.vmOutRepository.save({
          executionId,
          genId,
          phone: lead.phone,
          calls: lead.calls,
          lastCall: lead.lastCall ?? "",
          status,
          campanha: this.CAMPAIGN,
          contactList: this.CONTACT_LIST,
          rawPhone: lead.phone,
          reason,
        });
      } catch (err: any) {
        if (err?.number === 2601 || err?.number === 2627) {
          continue;
        }
        throw err;
      }

      if (status === "PENDING") {
        const payload = {
          campaignName: this.CAMPAIGN,
          contactCreateRequest: {
            Status: "Started",
            ContactListName: {
              RequestType: "Set",
              Value: this.CONTACT_LIST,
            },
            Attributes: [
              this.buildField("HomePhone", lead.phone),
              this.buildField("dataload", dataload),
            ],
          },
        };

        try {
          const response = await altitudeCreateContact.execute({
            environment: "cloud",
            payload,
          });

          await this.vmOutRepository.updateStatus(
            genId,
            "LOADED",
            undefined,
            JSON.stringify(response),
          );
        } catch (err: any) {
          await this.vmOutRepository.updateStatus(genId, "ERROR", err.message);
          console.error(`[VM_OUT] Erro ao enviar contato ${lead.phone}:`, err);
        }

        await this.sleep(1000);
      }
    }
    const totalEnviados = finalLeads.length;
    const totalBlacklist = uniqueLeads.filter((l) =>
      blacklistSet.has(l.phone),
    ).length;

    await sendEmail({
      to: [
        "ryan.martins@pluricall.pt",
        "margarida.raposo@pluricall.pt",
        "rita.carvalho@pluricall.pt",
        "raul.neto@pluricall.pt",
        "jorge.rodrigues@pluricall.pt",
        "beatriz.contreras@pluricall.pt",
        "susana.silva@pluricall.pt",
        "nuno.rainha@pluricall.pt",
      ],
      subject: `VM OUT - carregada com sucesso ${new Date().toLocaleString("pt-PT")}`,
      html: `
      <h2>VM OUT - Carregados</h2>
      <p><strong>Total carregados:</strong> ${totalEnviados}</p>
    <br/>
      <h2>VM OUT - Não carregados</h2>
      <p><strong>Blacklist:</strong> ${totalBlacklist}</p>
  `,
    });
    await this.fileService.deleteFile(filePath);
  }
}
