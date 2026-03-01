import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generatePlcId } from "../../../../shared/utils/generate-plc-id";
import { MinisomRepository } from "../../repositories/minisom.repository";

interface UploadContacts21051 {
  phoneNumber: string | number;
  leadId: any;
  name: any;
  bd: any;
  campaign: any;
  contactList: any;
  origem: any;
  email: any;
  genId: any;
  birthDate: any;
  utmSource: any;
  city: any;
}

export class Minisom21051UploadContactsUseCase {
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
    leadId,
    name,
    bd,
    email,
    genId,
    birthDate,
    utmSource,
    city,
    campaign,
    contactList,
    origem,
  }: UploadContacts21051) {
    try {
      const dataload = generateDataload();
      const plcId = generatePlcId();
      const origemAndSource = `${origem} ${utmSource || ""}`.trim();

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
            this.buildAltitudeField(
              "realizou_exame_tempo",
              String(origemAndSource),
            ),
            this.buildAltitudeField("HomeCity", String(city)),
            this.buildAltitudeField("Birthday", String(birthDate)),
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
      console.error("Erro inesperado no uploadContacts:", err);
      await this.minisomRepository.updateLeadStatus(genId, "ERROR");
    }
  }
}
