import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { generateDataload } from "../../../../utils/generate-dataload";
import { generatePlcId } from "../../../../utils/generate-plc-id";
import { MinisomRepository } from "../../repositories/minisom.repository";

interface UploadContactsMeta {
  phoneNumber: string;
  name: string;
  bd: string;
  email: string;
  genId: string;
  campaign: string;
  contactList: string;
  leadId: string | number;
}

export class MinisomMetaUploadContactsUseCase {
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
    name,
    bd,
    email,
    genId,
    campaign,
    contactList,
    leadId,
  }: UploadContactsMeta) {
    try {
      const dataload = generateDataload();
      const plcId = generatePlcId();

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
            this.buildAltitudeField("id_cliente", leadId),
            this.buildAltitudeField("Email1", email),
            this.buildAltitudeField("FirstName", name),
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
      console.error("Erro inesperado no MetaUploadContacts:", err);
      await this.minisomRepository.updateLeadStatus(genId, "ERROR");
    }
  }
}
