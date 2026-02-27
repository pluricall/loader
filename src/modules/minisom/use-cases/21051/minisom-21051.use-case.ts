import { AlreadyExistsError } from "../../../../use-cases/errors/name-already-exists-error";
import { generateNormalizedPhonePT } from "../../../../use-cases/servilusa/normalizer";
import { generateGenId } from "../../../../utils/generate-gen-id";
import { MinisomRepository } from "../../repositories/minisom.repository";
import { Minisom21051DTO } from "../../schemas/minisom-21051.schema";
import { Minisom21051UploadContactsUseCase } from "./upload-contacts.use-case";

export interface Minisom21051Request {
  bodyRequest: Minisom21051DTO;
  requestIp: string;
  requestUrl: string;
}

export class Minisom21051UseCase {
  constructor(
    private minisomRepository: MinisomRepository,
    private minisom21051UploadContacts: Minisom21051UploadContactsUseCase,
  ) {}

  private readonly currentYear = new Date().getFullYear();
  private readonly AUTH_KEY = "HRCecRJ3V30EXxO9QkESpKGV";
  private readonly CAMPAIGN = "MinisomExtNet";
  private readonly CONTACTLIST = `Net${this.currentYear}`;
  private readonly ORIGEM = "WEBSERVICE";

  async execute({ bodyRequest, requestIp, requestUrl }: Minisom21051Request) {
    if (bodyRequest.auth_key !== this.AUTH_KEY) {
      return {
        status: "error",
        statusMsg: "Invalid Authorization Key",
        genId: "",
      };
    }

    if (!bodyRequest.bd) {
      return {
        status: "error",
        status_msg: "Missing BD",
        gen_id: "",
      };
    }

    const genId = generateGenId();
    const normalizedPhoneNumber = generateNormalizedPhonePT(
      bodyRequest.phone_number,
    );

    const duplicatedLead = await this.minisomRepository.verifyIfLeadIdExists(
      bodyRequest.lead_id,
    );

    if (duplicatedLead) {
      throw new AlreadyExistsError("Lead ID already exists");
    }

    const fullName =
      `${bodyRequest.first_name} ${bodyRequest.last_name || ""}`.trim();

    await this.minisomRepository.insertAtLeadsRepository({
      lead_id: bodyRequest.lead_id,
      form_id: bodyRequest.form_id || "",
      email: bodyRequest.email,
      bd: bodyRequest.bd,
      full_name: fullName,
      raw_phone_number: bodyRequest.phone_number,
      phone_number: normalizedPhoneNumber,
      gen_id: genId,
      utm_source: bodyRequest.utm_source,
      request_ip: requestIp,
      request_url: requestUrl,
      formData: bodyRequest,
      campaignName: this.CAMPAIGN,
      contactList: this.CONTACTLIST,
      origem: this.ORIGEM,
      lead_status: "RECEIVED",
    });

    this.minisom21051UploadContacts.uploadContacts({
      campaign: this.CAMPAIGN,
      contactList: this.CONTACTLIST,
      origem: this.ORIGEM,
      phoneNumber: normalizedPhoneNumber,
      name: fullName,
      email: bodyRequest.email,
      bd: bodyRequest.bd,
      birthDate: bodyRequest.birth_date,
      city: bodyRequest.city,
      leadId: bodyRequest.lead_id,
      utmSource: bodyRequest.utm_source,
      genId,
    });

    return { status: "OK", statusMsg: "Lead loaded", genId };
  }
}
