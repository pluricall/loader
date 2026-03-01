import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generatePlcId } from "../../../../shared/utils/generate-plc-id";
import { MinisomRepository } from "../../repositories/minisom.repository";

interface UploadContactsCorporate {
  phoneNumber: string | number;
  email: any;
  name: any;
  bd: any;
  formTitle: any;
  adobeCampaignCode: any;
  marketingConsensusFlag: any;
  privacyConsensusFlag: any;
  address: any;
  language: any;
  genId: any;
  campaign: any;
  contactList: any;
  origem: any;
}

export class MinisomCorporateUploadContactsUseCase {
  constructor(
    private minisomRepository: MinisomRepository,
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
    phoneNumber,
    formTitle,
    name,
    bd,
    email,
    genId,
    adobeCampaignCode,
    campaign,
    contactList,
    origem,
    address,
    marketingConsensusFlag,
    privacyConsensusFlag,
    language,
  }: UploadContactsCorporate) {
    try {
      const dataload = generateDataload();
      const plcId = generatePlcId();
      const origemAndSource = `${origem} ${adobeCampaignCode || ""}`.trim();

      const payload = {
        campaignName: campaign,
        contactCreateRequest: {
          Status: "Started",
          ContactListName: { RequestType: "Set", Value: contactList },
          Attributes: [
            this.buildAltitudeField("MobilePhone", phoneNumber),
            this.buildAltitudeField("id_cliente", String(genId)),
            this.buildAltitudeField("Email1", String(email)),
            this.buildAltitudeField("FirstName", String(name)),
            this.buildAltitudeField("HomeStreet", String(address)),
            this.buildAltitudeField("Manager", String(privacyConsensusFlag)),
            this.buildAltitudeField(
              "Assistant",
              String(marketingConsensusFlag),
            ),
            this.buildAltitudeField(
              "realizou_exame_tempo",
              String(origemAndSource),
            ),
            this.buildAltitudeField("BusinessStreet", String(formTitle)),
            this.buildAltitudeField("PreferredLanguage", String(language)),
            this.buildAltitudeField("bd", String(bd)),
            this.buildAltitudeField("dataload", String(dataload)),
            this.buildAltitudeField("plc_id", String(plcId)),
          ],
        },
      };

      await this.altitudeCreateContact.execute({
        environment: "onprem",
        payload,
      });

      await this.minisomRepository.updateLeadStatus(genId, "LOADED");
    } catch (err: any) {
      console.error("Erro inesperado no CorporateUploadContacts:", err);
      await this.minisomRepository.updateLeadStatus(genId, "ERROR");
    }
  }
}
