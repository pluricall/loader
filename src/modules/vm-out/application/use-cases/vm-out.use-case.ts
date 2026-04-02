import { FileService } from "../../../../shared/infra/services/file.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generateGenId } from "../../../../shared/utils/generate-gen-id";
import { sendEmail } from "../../../../shared/utils/send-email";
import { IVmOutRepository } from "../../domain/repositories/vm-out.repository";
import { generateNormalizedPhonePT } from "../../../../shared/utils/generate-normalized-phone";
import { AltitudeAuthService } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeUploadContact } from "../../../../shared/infra/providers/altitude/upload-contact.service";

export class VmOutUseCase {
  constructor(
    private fileService: FileService,
    private vmOutRepository: IVmOutRepository,
  ) {}

  private readonly CONTACT_LIST = "Out";
  private readonly CAMPAIGN = "VM_OUT";
  private readonly BATCH_SIZE = 500;

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
    const campaign = this.CAMPAIGN;
    const contactList = this.CONTACT_LIST;
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
        subject: `VM OUT - ficheiro não encontrado ${new Date().toLocaleString("pt-PT")}`,
        html: `Processo executado sem ficheiro.`,
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
        subject: `VM OUT - ficheiro vazio`,
        html: `Ficheiro sem dados.`,
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

    const uniqueLeads = Array.from(
      new Map(leads.map((l) => [l.phone, l])).values(),
    );

    const executionId = crypto.randomUUID();

    const leadsWithMeta = uniqueLeads.map((lead) => {
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

      return { ...lead, genId, status, reason };
    });

    const CHUNK_SIZE = 200;

    for (let i = 0; i < leadsWithMeta.length; i += CHUNK_SIZE) {
      const chunk = leadsWithMeta.slice(i, i + CHUNK_SIZE);

      await this.vmOutRepository.saveBulk(
        chunk.map((lead) => ({
          executionId,
          genId: lead.genId,
          phone: lead.phone,
          calls: lead.calls,
          lastCall: lead.lastCall ?? "",
          status: lead.status,
          campanha: campaign,
          contactList,
          rawPhone: lead.phone,
          reason: lead.reason,
        })),
      );
    }

    const pendingLeads = leadsWithMeta.filter((l) => l.status === "PENDING");

    const altitudeUpload = new AltitudeUploadContact(new AltitudeAuthService());

    const uploadBatches: { lead: any; request: any }[][] = [];

    for (let i = 0; i < pendingLeads.length; i += this.BATCH_SIZE) {
      const chunk = pendingLeads.slice(i, i + this.BATCH_SIZE);

      const batch = chunk.map((lead) => ({
        lead,
        request: {
          RequestType: "Insert",
          Value: {
            discriminator: "ContactUploadRequest",
            ContactStatus: { Value: "Started" },
            ContactListName: {
              RequestType: "Set",
              Value: contactList,
            },
            Attributes: [
              this.buildField("HomePhone", lead.phone),
              this.buildField("dataload", dataload),
            ],
          },
        },
      }));

      uploadBatches.push(batch);
    }

    for (const batch of uploadBatches) {
      const genIds = batch.map((item) => item.lead.genId);
      try {
        const response = await altitudeUpload.execute({
          environment: "cloud",
          payload: {
            campaignName: campaign,
            requests: batch.map((r) => r.request),
          },
        });

        await this.vmOutRepository.updateStatusBulk(
          genIds,
          "LOADED",
          undefined,
          JSON.stringify(response),
        );
      } catch (err: any) {
        await this.vmOutRepository.updateStatusBulk(
          genIds,
          "ERROR",
          err.message,
        );

        console.error("[VM_OUT] Batch error:", err);
      }
    }

    const totalEnviados = pendingLeads.length;
    const totalBlacklist = leadsWithMeta.filter(
      (l) => l.reason === "BLACKLIST",
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
      subject: `VM OUT - sucesso`,
      html: `
        <h2>Carregados</h2>
        <p>${totalEnviados}</p>
        <h2>Blacklist</h2>
        <p>${totalBlacklist}</p>
      `,
    });

    await this.fileService.deleteFile(filePath);
  }
}
