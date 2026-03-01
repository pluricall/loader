import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { AgilidadeRepository } from "../../repositories/agilidade.repository";

export interface AgilidadeUploadContactRequest {
  campaignName: any;
  contactList: any;
  phoneNumber: string | number;
  nome: any;
  email: any;
  lead_id: any;
  localidade: any;
  ad_id: any;
  adset_id: any;
  campaign_id: any;
  adset_name: any;
  created_date: any;
  ad_name: any;
  campaign_name: any;
  form_id: any;
  campaign: any;
  genId: any;
}

export class Agilidade24041UploadContactsUseCase {
  constructor(
    private agilidadeRepository: AgilidadeRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  private buildAltitudeField(Name: string, Value: any) {
    return {
      discriminator: "DatabaseFields",
      Name,
      Value: Value ?? "",
      IsAnonymized: false,
    };
  }

  async execute({
    campaign,
    contactList,
    phoneNumber,
    email,
    nome,
    lead_id,
    localidade,
    ad_id,
    adset_id,
    campaign_id,
    adset_name,
    created_date,
    ad_name,
    campaign_name,
    form_id,
    genId,
  }: AgilidadeUploadContactRequest) {
    try {
      const dataload = generateDataload();

      const payload = {
        campaignName: campaign,
        contactCreateRequest: {
          Status: "Started",
          ContactListName: {
            RequestType: "Set",
            Value: contactList,
          },
          Attributes: [
            this.buildAltitudeField("HomePhone", phoneNumber),
            this.buildAltitudeField("telefone", phoneNumber),
            this.buildAltitudeField("enderecoemail", String(email)),
            this.buildAltitudeField("nome", String(nome)),
            this.buildAltitudeField("FirstName", String(nome)),
            this.buildAltitudeField("localidade", String(localidade)),
            this.buildAltitudeField("bd_id", String(lead_id)),
            this.buildAltitudeField("bd_created_time", String(created_date)),
            this.buildAltitudeField("bd_ad_id", String(ad_id)),
            this.buildAltitudeField("bd_ad_name", String(ad_name)),
            this.buildAltitudeField("bd_adset_id", String(adset_id)),
            this.buildAltitudeField("bd_adset_name", String(adset_name)),
            this.buildAltitudeField("bd_campaign_id", String(campaign_id)),
            this.buildAltitudeField("bd_campaign_name", String(campaign_name)),
            this.buildAltitudeField("bd_form_id", String(form_id)),
            this.buildAltitudeField("plc_id", String(genId)),
            this.buildAltitudeField("dataload", String(dataload)),
          ],
        },
      };

      await this.altitudeCreateContact.execute({
        environment: "onprem",
        payload,
      });

      await this.agilidadeRepository.updateLeadStatus(genId, "LOADED");
    } catch (err: any) {
      console.error("Erro inesperado no 21121UploadContacts:", err);
      await this.agilidadeRepository.updateLeadStatus(genId, "ERROR");
    }
  }
}
