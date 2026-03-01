import { FieldRequiredError } from "../../../../shared/errors/field-required";
import { AlreadyExistsError } from "../../../../shared/errors/name-already-exists-error";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import { generateGenId } from "../../../../shared/utils/generate-gen-id";
import { generateNormalizedPhonePT } from "../../../../shared/utils/generate-normalized-phone";
import { MinisomRepository } from "../../repositories/minisom.repository";
import { Minisom21121DTO } from "../../schemas/minisom-21121.schema";
import { Minisom21121UploadContactsUseCase } from "./upload-contacts.use-case";

export interface Minisom21121Request {
  bodyRequest: Minisom21121DTO;
  requestIp: string;
  requestUrl: string;
}

export class Minisom21121UseCase {
  constructor(
    private minisomRepository: MinisomRepository,
    private minisom21121UploadContacts: Minisom21121UploadContactsUseCase,
  ) {}

  private readonly YEAR = new Date().getFullYear();
  private readonly AUTH_KEY = "RVXfaZAIDGei8nKt";
  private readonly CAMPAIGN = "MinisomExtNet";
  private readonly CONTACTLIST = `Net${this.YEAR}`;
  private readonly ORIGEM = "WEBSERVICE";

  async execute({ bodyRequest, requestIp, requestUrl }: Minisom21121Request) {
    if (bodyRequest.auth_key !== this.AUTH_KEY) {
      throw new UnauthorizedError("Invalid Authorization Key");
    }

    if (!bodyRequest.bd) {
      throw new FieldRequiredError("BD is required");
    }

    const duplicatedLead = await this.minisomRepository.verifyIfLeadIdExists(
      bodyRequest.lead_id,
    );

    if (duplicatedLead) {
      throw new AlreadyExistsError("Lead ID already exists");
    }

    const genId = generateGenId();
    const normalizedPhoneNumber = generateNormalizedPhonePT(
      bodyRequest.phone_number,
    );
    const fullName =
      `${bodyRequest.first_name} ${bodyRequest.last_name || ""}`.trim();

    await this.minisomRepository.insertAtLeadsRepository({
      leadId: bodyRequest.lead_id || "",
      campaign: bodyRequest.form_id || "",
      email: bodyRequest.email || "",
      bd: bodyRequest.bd || "",
      firstName: bodyRequest.first_name || "",
      rawPhoneNumber: bodyRequest.phone_number,
      phoneNumber: normalizedPhoneNumber,
      genId,
      utmSource: bodyRequest.utm_source || "",
      requestIp: requestIp || "",
      requestUrl: requestUrl || "",
      formData: bodyRequest || "",
      address: bodyRequest.address || "",
      city: bodyRequest.city || "",
      createdDate: bodyRequest.created_date || "",
      lastName: bodyRequest.last_name || "",
      postedDate: bodyRequest.posted_date || "",
      mappingTemplate: "DEFAULT",
      autDados: "",
      age: "",
      difAuditiva: "",
      distId: "",
      notes1: "",
      notes2: "",
      notes3: "",
      postCode: "",
      score: "",
      siteId: "",
      campanhaEasy: this.CAMPAIGN,
      contactList: this.CONTACTLIST,
      origem: this.ORIGEM,
      leadStatus: "RECEIVED",
    });

    this.minisom21121UploadContacts.execute({
      phoneNumber: normalizedPhoneNumber,
      name: fullName,
      genId,
      email: bodyRequest.email || "",
      bd: bodyRequest.bd,
      birthDate: bodyRequest.birth_date || "",
      city: bodyRequest.city || "",
      leadId: bodyRequest.lead_id || "",
      utmSource: bodyRequest.utm_source || "",
      campaign: this.CAMPAIGN,
      contactList: this.CONTACTLIST,
      origem: this.ORIGEM,
    });

    return { status: "OK", statusMsg: "Lead loaded with success.", genId };
  }
}
