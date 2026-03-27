import path from "path";
import { altitudeQueue } from "../../../../shared/infra/queue/altitude/altitude-queue";
import { FileService } from "../../../../shared/infra/services/file.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generateGenId } from "../../../../shared/utils/generate-gen-id";
import { generateNormalizedPhonePT } from "../../../../shared/utils/generate-normalized-phone";
import { sendEmail } from "../../../../shared/utils/send-email";
import { IVmOutRepository } from "../../domain/repositories/vm-out.repository";

export class VmOutUseCase {
  constructor(
    private fileService: FileService,
    private vmOutRepository: IVmOutRepository,
  ) {}

  private readonly CONTACT_LIST = "Outbound_Test";
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

  async execute() {
    const executionDate = new Date();
    const dataload = generateDataload();

    const folder = String.raw`\\hercules\Supervisao\Campanhas\rerun_natura`;
    const fileName = "carregar.csv";
    const filePath = path.join(folder, fileName);
    const processedFolder = path.join(folder, "carregado");
    const newFileName = `${new Date().toISOString()}_carregado.csv`;
    const destPath = path.join(processedFolder, newFileName);

    const exists = await this.fileService.exists(filePath);

    if (!exists) {
      return await sendEmail({
        to: ["ryan.martins@pluricall.pt"],
        subject: "VM OUT - ficheiro não encontrado",
        html: `Processo executado às ${new Date().toLocaleString("pt-PT")} sem ficheiro.`,
      });
    }

    const rows = await this.fileService.parseCSV(filePath);

    if (!rows.length) {
      return await sendEmail({
        to: ["ryan.martins@pluricall.pt"],
        subject: "VM OUT - ficheiro vazio",
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
    const attendedSet = new Set(attendedToday);

    const finalLeads = leads
      .filter((l) => !attendedSet.has(l.phone))
      .filter((l) => !blacklistSet.has(l.phone));

    const executionId = crypto.randomUUID();

    for (const lead of leads) {
      const genId = generateGenId();
      let status = "PENDING";
      let reason = "";

      if (blacklistSet.has(lead.phone)) {
        status = "FILTERED";
        reason = "BLACKLIST";
      } else if (attendedSet.has(lead.phone)) {
        status = "FILTERED";
        reason = "ATTENDED";
      }

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
        await altitudeQueue.add("create-contact", {
          environment: "cloud",
          payload,
          genId,
          repository: "vm-out",
        });
      }
    }

    const totalCsv = leads.length;
    const totalEnviados = finalLeads.length;
    const totalBlacklist = leads.filter((l) =>
      blacklistSet.has(l.phone),
    ).length;
    const totalAttended = leads.filter((l) => attendedSet.has(l.phone)).length;

    await sendEmail({
      to: ["ryan.martins@pluricall.pt"],
      subject: `VM OUT - carregada com sucesso`,
      html: `
     <h2>VM OUT - Recebidos</h2>
      <p><strong>Total:</strong> ${totalCsv}</p>
      <br/>
    <br/>
      <h2>VM OUT - Carregados</h2>
      <p><strong>Total carregados:</strong> ${totalEnviados}</p>
    <br/>
      <h2>VM OUT - Não carregados</h2>
      <p><strong>Blacklist:</strong> ${totalBlacklist}</p>
      <p><strong>Já contactados hoje:</strong> ${totalAttended}</p>
  `,
    });
    await this.fileService.moveFile(filePath, destPath);
  }
}
