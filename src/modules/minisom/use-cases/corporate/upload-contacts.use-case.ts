import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { generateDataload } from "../../../../utils/generate-dataload";
import { generatePlcId } from "../../../../utils/generate-plc-id";
import { MinisomRepository } from "../../repositories/minisom.repository";

interface UploadContactsCorporate {
  phoneNumber: string;
  email: string;
  name: string;
  bd: string;
  formTitle: string;
  adobeCampaignCode: string;
  marketingConsensusFlag: string;
  privacyConsensusFlag: string;
  address: string;
  language: string;
  genId: string;
  campaign: string;
  contactList: string;
  origem: string;
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
            this.buildAltitudeField("id_cliente", genId),
            this.buildAltitudeField("Email1", email),
            this.buildAltitudeField("FirstName", name),
            this.buildAltitudeField("HomeStreet", address),
            this.buildAltitudeField("Manager", privacyConsensusFlag),
            this.buildAltitudeField("Assistant", marketingConsensusFlag),
            this.buildAltitudeField("realizou_exame_tempo", origemAndSource),
            this.buildAltitudeField("BusinessStreet", formTitle),
            this.buildAltitudeField("PreferredLanguage", language),
            this.buildAltitudeField("bd", bd),
            this.buildAltitudeField("dataload", dataload),
            this.buildAltitudeField("plc_id", plcId),
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
