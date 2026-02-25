import { MinisomRepository } from "../../repositories/minisom-repository";
import { AltitudeCreateContact } from "../altitude/create-contact";
import { AlreadyExistsError } from "../errors/name-already-exists-error";

export interface Minisom21051Request {
  auth_key: string;
  phone_number: string;
  lead_id: string | number;
  first_name: string;
  bd: string;
  email: string;
  form_id?: string | number;
  last_name?: string;
  campaign?: any;
  birth_date?: any;
  created_date?: any;
  posted_date?: any;
  marketing?: any;
  privacy?: any;
  utm_source?: any;
  utm_code?: any;
  additional1?: any;
  additional2?: any;
  additional3?: any;
  address?: any;
  city?: any;
  post_code?: any;
  site_id?: any;
  dif_auditiva?: any;
  request_ip: string;
  request_url: string;
  partner_id?: string;
}

export class Minisom21051UseCase {
  constructor(
    private minisomRepository: MinisomRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  private normalizePhone(phone?: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("351")) cleaned = cleaned.slice(3);
    return cleaned;
  }

  private generatePlcId(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const datePart = `${year}${month}${day}`;

    const randomPart = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");

    return `${datePart}_${randomPart}`;
  }

  private uniqid(prefix = ""): string {
    const ts = Date.now().toString(16);
    const random = Math.floor(Math.random() * 0xfffff).toString(16);
    return prefix + ts + random;
  }

  async execute(request: Minisom21051Request) {
    if (request.auth_key !== "HRCecRJ3V30EXxO9QkESpKGV" || !request.bd) {
      return {
        status: "error",
        status_msg: "Invalid Authorization Key or Missing BD",
        gen_id: "",
      };
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dataload = `${year}-${month}-${day}`;
    const origem = "WEBSERVICE";
    const plc_id = this.generatePlcId();

    const duplicatedLead = await this.minisomRepository.verifyIfLeadIdExists(
      request.lead_id,
    );
    if (duplicatedLead) {
      throw new AlreadyExistsError("Lead ID já existe");
    }

    const gen_id = this.uniqid();
    const normalizedPhoneNumber = this.normalizePhone(request.phone_number);
    const contactList = "Net2026";
    const campaign = "MinisomExtNet";

    const payload = {
      campaignName: "MinisomExtNet",
      contactCreateRequest: {
        Status: "Started",
        ContactListName: {
          RequestType: "Set",
          Value: "Net2026",
        },
        Attributes: [
          {
            discriminator: "DatabaseFields",
            Name: "HomePhone",
            Value: normalizedPhoneNumber,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "id_cliente",
            Value: request.lead_id,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "Email1",
            Value: request.email,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "FirstName",
            Value: `${request.first_name} ${request.last_name || ""}`.trim(),
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "bd",
            Value: request.bd,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "realizou_exame_tempo",
            Value: `${origem} ${request.utm_source || ""}`,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "HomeCity",
            Value: request.city || "",
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "Birthday",
            Value: request.birth_date || "",
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "dataload",
            Value: dataload,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "plc_id",
            Value: plc_id,
            IsAnonymized: false,
          },
        ],
      },
    };

    await this.altitudeCreateContact.execute({
      environment: "onprem",
      payload,
    });

    await this.minisomRepository.insertAtLeadsRepository({
      lead_id: request.lead_id,
      form_id: request.form_id || "",
      email: request.email,
      full_name: `${request.first_name} ${request.last_name || ""}`.trim(),
      phone_number: request.phone_number,
      formalizedNumber: normalizedPhoneNumber,
      campaignName: campaign,
      contactList,
      formData: request,
      genId: gen_id,
      request_ip: request.request_ip,
      request_url: request.request_url,
      origem,
      lead_status: "NEW PROCESS",
      utm_source: request.utm_source,
    });

    return { status: "OK", status_msg: "", gen_id };
  }
}
