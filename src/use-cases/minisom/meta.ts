import { MinisomRepository } from "../../repositories/minisom-repository";
import { AltitudeCreateContact } from "../altitude/create-contact";
import { AlreadyExistsError } from "../errors/name-already-exists-error";
import { NotFoundError } from "../errors/not-found-error";

export interface MinisomMetaRequest {
  lead_id: string;
  form_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  formData: Record<string, any>;
  request_ip: string;
  request_url: string;
}

export class MinisomMetaUseCase {
  constructor(
    private minisomRepository: MinisomRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  private normalizePhoneNumber(phone?: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("351")) {
      cleaned = cleaned.slice(3);
    }
    return cleaned;
  }

  private uniqid(prefix = ""): string {
    const ts = Date.now().toString(16);
    const random = Math.floor(Math.random() * 0xfffff).toString(16);
    return prefix + ts + random;
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

  async execute(request: MinisomMetaRequest) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dataload = `${year}-${month}-${day}`;
    const formalizedNumber = this.normalizePhoneNumber(request.phone_number);
    const gen_id = this.uniqid();
    const contactList = "Net2026";
    const campaign = "MinisomExtNet";
    const plc_id = this.generatePlcId();

    const bd = await this.minisomRepository.getBdByFormId(request.form_id);
    if (!bd) {
      throw new NotFoundError("BD não encontrada para este form_id");
    }

    const duplicatedLead = await this.minisomRepository.verifyIfLeadIdExists(
      request.lead_id,
    );
    if (duplicatedLead) {
      throw new AlreadyExistsError("Lead ID já existe");
    }

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
            Value: formalizedNumber,
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
            Value: request.full_name,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "bd",
            Value: bd.bd,
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
      form_id: request.form_id,
      email: request.email,
      full_name: request.full_name,
      phone_number: request.phone_number,
      formalizedNumber,
      campaignName: campaign,
      contactList,
      formData: request.formData,
      genId: gen_id,
      request_ip: request.request_ip,
      request_url: request.request_url,
      origem: "META",
      lead_status: "NEW PROCESS",
      bd: bd.bd,
    });
  }
}
