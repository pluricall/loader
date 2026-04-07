import { altitudeQueue } from "../../../../shared/infra/queue/altitude/altitude-queue";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generatePlcId } from "../../../../shared/utils/generate-plc-id";

interface UploadContacts21121 {
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
  privacy: any;
  marketing: any;
}

export class Minisom21121UploadContactsUseCase {
  private buildAltitudeField(Name: string, Value: any) {
    if (Name === "FirstName" && typeof Value === "string") {
      Value = Value.substring(0, 100);
    }

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

  async execute({
    phoneNumber,
    leadId,
    name,
    bd,
    email,
    genId,
    utmSource,
    campaign,
    contactList,
    origem,
    birthDate,
    city,
    marketing,
    privacy,
  }: UploadContacts21121) {
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
          this.buildAltitudeField("Manager", String(privacy)),
          this.buildAltitudeField("Assistant", String(marketing)),
        ],
      },
    };
    await altitudeQueue.add("create-contact", {
      environment: "onprem",
      payload,
      genId,
      repository: "minisom21121",
    });
  }
}
