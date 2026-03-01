import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generatePlcId } from "../../../../shared/utils/generate-plc-id";
import { MinisomRepository } from "../../repositories/minisom.repository";

interface UploadContactsMeta {
  phoneNumber: string | number;
  name: any;
  bd: any;
  email: any;
  genId: any;
  campaign: any;
  contactList: any;
  leadId: any;
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
            this.buildAltitudeField("id_cliente", String(leadId)),
            this.buildAltitudeField("Email1", String(email)),
            this.buildAltitudeField("FirstName", String(name)),
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
      console.error("Erro inesperado no MetaUploadContacts:", err);
      await this.minisomRepository.updateLeadStatus(genId, "ERROR");
    }
  }
}
