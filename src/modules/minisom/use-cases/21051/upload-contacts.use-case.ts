import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { generateDataload } from "../../../../utils/generate-dataload";
import { generatePlcId } from "../../../../utils/generate-plc-id";
import { MinisomRepository } from "../../repositories/minisom.repository";

interface UploadContacts21051 {
  phoneNumber: string;
  leadId: string | number;
  name: string;
  bd: string;
  campaign: string;
  contactList: string;
  origem: string;
  email: string;
  genId: string;
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

  async uploadContacts({
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
            this.buildAltitudeField("id_cliente", leadId),
            this.buildAltitudeField("Email1", email),
            this.buildAltitudeField("FirstName", name),
            this.buildAltitudeField("bd", bd),
            this.buildAltitudeField("realizou_exame_tempo", origemAndSource),
            this.buildAltitudeField("HomeCity", city),
            this.buildAltitudeField("Birthday", birthDate),
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
      console.error("Erro inesperado no uploadContacts:", err);
      await this.minisomRepository.updateLeadStatus(genId, "ERROR");
    }
  }
}
