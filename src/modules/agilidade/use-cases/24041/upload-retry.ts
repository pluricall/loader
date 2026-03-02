import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { AgilidadeRepository } from "../../repositories/agilidade.repository";
import { AgilidadeUploadContactRequest } from "./upload-contacts.use-case";

export class Agilidade24041UploadContactsUseCase {
  private static queue: Array<{
    data: AgilidadeUploadContactRequest;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  private static isProcessing = false;
  private static readonly DELAY_BETWEEN_REQUESTS = 300;

  constructor(
    private agilidadeRepository: AgilidadeRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  private buildAltitudeField(Name: string, Value: any) {
    if (Name === "FirstName" && typeof Value === "string") {
      Value = Value.substring(0, 100);
    }
    return {
      discriminator: "DatabaseFields",
      Name,
      Value: Value ?? "",
      IsAnonymized: false,
    };
  }

  async execute(data: AgilidadeUploadContactRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      Agilidade24041UploadContactsUseCase.queue.push({ data, resolve, reject });
      if (!Agilidade24041UploadContactsUseCase.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (Agilidade24041UploadContactsUseCase.isProcessing) return;

    Agilidade24041UploadContactsUseCase.isProcessing = true;

    while (Agilidade24041UploadContactsUseCase.queue.length > 0) {
      const nextItem = Agilidade24041UploadContactsUseCase.queue.shift();
      if (!nextItem) continue;
      try {
        console.log(
          `[FILA] Processando lead ${nextItem.data.genId}. Fila: ${Agilidade24041UploadContactsUseCase.queue.length}`,
        );
        const dataload = generateDataload();

        const payload = {
          campaignName: nextItem.data.campaign,
          contactCreateRequest: {
            Status: "Started",
            ContactListName: {
              RequestType: "Set",
              Value: nextItem.data.contactList,
            },
            Attributes: [
              this.buildAltitudeField("HomePhone", nextItem.data.phoneNumber),
              this.buildAltitudeField("telefone", nextItem.data.phoneNumber),
              this.buildAltitudeField(
                "enderecoemail",
                String(nextItem.data.email),
              ),
              this.buildAltitudeField("nome", String(nextItem.data.nome)),
              this.buildAltitudeField("FirstName", String(nextItem.data.nome)),
              this.buildAltitudeField(
                "localidade",
                String(nextItem.data.localidade),
              ),
              this.buildAltitudeField("bd_id", String(nextItem.data.lead_id)),
              this.buildAltitudeField(
                "bd_created_time",
                String(nextItem.data.created_date),
              ),
              this.buildAltitudeField("bd_ad_id", String(nextItem.data.ad_id)),
              this.buildAltitudeField(
                "bd_ad_name",
                String(nextItem.data.ad_name),
              ),
              this.buildAltitudeField(
                "bd_adset_id",
                String(nextItem.data.adset_id),
              ),
              this.buildAltitudeField(
                "bd_adset_name",
                String(nextItem.data.adset_name),
              ),
              this.buildAltitudeField(
                "bd_campaign_id",
                String(nextItem.data.campaign_id),
              ),
              this.buildAltitudeField(
                "bd_campaign_name",
                String(nextItem.data.campaign_name),
              ),
              this.buildAltitudeField(
                "bd_form_id",
                String(nextItem.data.form_id),
              ),
              this.buildAltitudeField("plc_id", String(nextItem.data.genId)),
              this.buildAltitudeField("dataload", String(dataload)),
            ],
          },
        };

        await this.executeWithRetry(payload, nextItem.data.genId);

        await this.agilidadeRepository.updateLeadStatus(
          nextItem.data.genId,
          "LOADED",
        );

        nextItem.resolve();

        console.log(
          `[FILA] Lead ${nextItem.data.genId} processado com SUCESSO`,
        );

        await this.delay(
          Agilidade24041UploadContactsUseCase.DELAY_BETWEEN_REQUESTS,
        );
      } catch (error) {
        console.error(`[FILA] Erro no lead ${nextItem.data.genId}:`, error);

        try {
          await this.agilidadeRepository.updateLeadStatus(
            nextItem.data.genId,
            "ERROR",
          );
        } catch (updateError) {
          console.error(
            `[FILA] Erro ao atualizar status do lead ${nextItem.data.genId}:`,
            updateError,
          );
        }

        nextItem.reject(error);
      }
    }

    Agilidade24041UploadContactsUseCase.isProcessing = false;
    console.log("[FILA] Processamento concluído");
  }

  private async executeWithRetry(
    payload: any,
    genId: string,
    attempts = 3,
  ): Promise<any> {
    for (let i = 1; i <= attempts; i++) {
      try {
        return await this.altitudeCreateContact.execute({
          environment: "onprem",
          payload,
        });
      } catch (error) {
        console.log(`[RETRY ${i}/${attempts}] Falha no lead ${genId}`);

        if (i === attempts) {
          throw error;
        }

        await this.delay(1000 * Math.pow(2, i - 1));
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
