import { altitudeQueue } from "../../../../shared/infra/queue/altitude/altitude-queue";
import { generateDataload } from "../../../../shared/utils/generate-dataload";
import { generatePlcId } from "../../../../shared/utils/generate-plc-id";

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

    await altitudeQueue.add("create-contact", {
      environment: "onprem",
      payload,
      genId,
      repository: "minisomMeta",
    });
  }
}
