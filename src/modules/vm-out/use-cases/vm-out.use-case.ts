import { generateDataload } from "../../../shared/utils/generate-dataload";
import { generateGenId } from "../../../shared/utils/generate-gen-id";
import { generateNormalizedPhonePT } from "../../../shared/utils/generate-normalized-phone";
import { AltitudeAuthService } from "../../../shared/infra/providers/altitude/auth.service";
import { AltitudeUploadContact } from "../../../shared/infra/providers/altitude/upload-contact.service";
import { sendNotification } from "../../../shared/notification/send-notification";
import { IVmOutRepository } from "../infra/repositories/vm-out.repository";
import {
  ArtelecomReportRow,
  ArtelecomReportService,
} from "../../../shared/infra/providers/artelecom/artelecom-report.service";

export class VmOutUseCase {
  constructor(
    private vmOutRepository: IVmOutRepository,
    private artelecomReportService: ArtelecomReportService,
  ) {}

  private readonly CONTACT_LIST = "Default Contact List for Campaign VM_OUT";
  private readonly CAMPAIGN = "VM_OUT";
  private readonly BATCH_SIZE = 500;
  private readonly IVR_ID = 14;
  private readonly STATISTIC_TYPE_ID = 3;

  private emailRecipients = [
    "ryan.martins@pluricall.pt",
    "margarida.raposo@pluricall.pt",
    "rita.carvalho@pluricall.pt",
    "raul.neto@pluricall.pt",
    "jorge.rodrigues@pluricall.pt",
    "beatriz.contreras@pluricall.pt",
    "susana.silva@pluricall.pt",
    "nuno.rainha@pluricall.pt",
  ];

  async execute() {
    const campaign = this.CAMPAIGN;
    const contactList = this.CONTACT_LIST;
    const executionDate = new Date();
    const dataload = generateDataload();

    let rows: ArtelecomReportRow[];
    try {
      rows = await this.artelecomReportService.downloadCSV(
        this.IVR_ID,
        this.STATISTIC_TYPE_ID,
      );
    } catch (err: any) {
      return await sendNotification({
        channel: "email",
        payload: {
          to: this.emailRecipients,
          subject: `VM OUT - erro ao obter ficheiro ${new Date().toLocaleString("pt-PT")}`,
          html: `Erro ao contactar a API Artelecom: ${err.message}`,
        },
      });
    }

    if (!rows.length) {
      return await sendNotification({
        channel: "email",
        payload: {
          to: this.emailRecipients,
          subject: `VM OUT - ficheiro vazio ${new Date().toLocaleString("pt-PT")}`,
          html: `Ficheiro sem dados.`,
        },
      });
    }

    const leads = rows.map((r) => ({
      phone: generateNormalizedPhonePT(String(r.numero)),
      calls: r.chamadas,
      lastCall: r.ultimaChamada,
      executionDate,
    }));

    const blacklist = await this.vmOutRepository.getBlacklist();
    const attendedToday = await this.vmOutRepository.getAttendedToday();
    const blacklistSet = new Set(blacklist);
    const alreadyLoaded = new Set(attendedToday);

    const leadsWithMeta = Array.from(
      new Map(
        leads.map((lead) => {
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

          return [lead.phone, { ...lead, genId, status, reason }];
        }),
      ).values(),
    );

    const CHUNK_SIZE = 200;
    for (let i = 0; i < leadsWithMeta.length; i += CHUNK_SIZE) {
      const chunk = leadsWithMeta.slice(i, i + CHUNK_SIZE);

      await this.vmOutRepository.saveBulk(
        chunk.map((lead) => ({
          executionId: crypto.randomUUID(),
          genId: lead.genId,
          phone: lead.phone,
          calls: lead.calls,
          lastCall: lead.lastCall ?? "",
          status: lead.status,
          campanha: this.CAMPAIGN,
          contactList,
          rawPhone: lead.phone,
          reason: lead.reason,
        })),
      );
    }

    const pendingLeads = leadsWithMeta.filter((l) => l.status === "PENDING");

    for (let i = 0; i < pendingLeads.length; i += this.BATCH_SIZE) {
      const batch = pendingLeads.slice(i, i + this.BATCH_SIZE).map((lead) => ({
        lead,
        request: {
          RequestType: "Insert",
          Value: {
            discriminator: "ContactUploadRequest",
            ContactStatus: { Value: "Started" },
            ContactListName: { RequestType: "Set", Value: contactList },
            Attributes: [
              this.buildField("MobilePhone", lead.phone),
              this.buildField("dataload", dataload),
            ],
          },
        },
      }));

      const genIds = batch.map((item) => item.lead.genId);

      try {
        const response = await new AltitudeUploadContact(
          new AltitudeAuthService(),
        ).execute({
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
        batch.forEach((item) => (item.lead.status = "LOADED"));
      } catch (err: any) {
        await this.vmOutRepository.updateStatusBulk(
          genIds,
          "ERROR",
          err.message,
        );
        batch.forEach((item) => (item.lead.status = "ERROR"));
        console.error("[VM_OUT] Batch error:", err);
      }
    }

    const totalEnviados = pendingLeads.length;
    const reportBuffer = this.buildReportCSV(rows, leadsWithMeta);
    const reportFileName = `VmOut_${new Date().toISOString().slice(0, 10)}.csv`;

    await sendNotification({
      channel: "email",
      payload: {
        to: this.emailRecipients,
        subject: `VM OUT - Sucesso no carregamento - ${new Date().toLocaleString("pt-PT")}`,
        html: `<h2>Carregados</h2><p>Total: ${totalEnviados}</p>`,
        attachments: [
          {
            filename: reportFileName,
            content: reportBuffer,
          },
        ],
      },
    });
  }

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

  private buildReportCSV(
    rows: ArtelecomReportRow[],
    leadsWithMeta: Array<{ phone: string; status: string; reason: string }>,
  ): Buffer {
    const metaMap = new Map(leadsWithMeta.map((l) => [l.phone, l]));

    const getEstado = (phone: string): string => {
      const meta = metaMap.get(phone);
      if (!meta) return "DESCONHECIDO";
      if (meta.status === "FILTERED" && meta.reason === "BLACKLIST")
        return "BLACKLIST";
      if (meta.status === "FILTERED" && meta.reason === "ATTENDED")
        return "CONTACTADO";
      if (meta.status === "LOADED") return "CARREGADO";
      if (meta.status === "ERROR") return "ERRO AO CARREGAR";
      if (meta.status === "PENDING") return "PENDENTE";
      return meta.status;
    };

    const csvLines = [
      "Número;Chamadas;Última Chamada;Estado",
      ...rows.map((row) => {
        const phone = generateNormalizedPhonePT(String(row.numero));
        const estado = getEstado(phone);
        return `${row.numero};${row.chamadas};${row.ultimaChamada};${estado}`;
      }),
    ];

    return Buffer.from(csvLines.join("\n"), "utf-8");
  }
}
