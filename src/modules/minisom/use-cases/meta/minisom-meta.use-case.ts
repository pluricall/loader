import { AlreadyExistsError } from "../../../../use-cases/errors/name-already-exists-error";
import { NotFoundError } from "../../../../use-cases/errors/not-found-error";
import { generateNormalizedPhonePT } from "../../../../use-cases/servilusa/normalizer";
import { generateGenId } from "../../../../utils/generate-gen-id";
import { MinisomRepository } from "../../repositories/minisom.repository";
import { MinisomMetaDTO } from "../../schemas/minisom-meta.schema";
import { MinisomMetaUploadContactsUseCase } from "./upload-contacts.use-case";

export interface MinisomMetaRequest {
  bodyRequest: MinisomMetaDTO;
  requestIp: string;
  requestUrl: string;
}

export class MinisomMetaUseCase {
  constructor(
    private minisomRepository: MinisomRepository,
    private minisomMetaUploadContacts: MinisomMetaUploadContactsUseCase,
  ) {}

  private readonly YEAR = new Date().getFullYear();
  private readonly CAMPAIGN = "MinisomExtNet";
  private readonly CONTACTLIST = `Net${this.YEAR}`;
  private readonly ORIGEM = "FACEBOOK";

  async execute({ bodyRequest, requestIp, requestUrl }: MinisomMetaRequest) {
    const normalizedPhoneNumber = generateNormalizedPhonePT(
      bodyRequest.phone_number,
    );

    const bd = await this.minisomRepository.getBdByFormId(bodyRequest.form_id);
    if (!bd) {
      throw new NotFoundError("Form Id not found");
    }

    const duplicatedLead = await this.minisomRepository.verifyIfLeadIdExists(
      bodyRequest.lead_id,
    );

    if (duplicatedLead) {
      throw new AlreadyExistsError("Lead ID already exists");
    }

    const genId = generateGenId();

    this.minisomRepository.insertAtLeadsRepository({
      lead_id: bodyRequest.lead_id,
      form_id: bodyRequest.form_id,
      email: bodyRequest.email,
      full_name: bodyRequest.full_name,
      raw_phone_number: bodyRequest.phone_number,
      phone_number: normalizedPhoneNumber,
      campaignName: this.CAMPAIGN,
      contactList: this.CONTACTLIST,
      formData: bodyRequest,
      gen_id: genId,
      request_ip: requestIp,
      request_url: requestUrl,
      origem: this.ORIGEM,
      lead_status: "RECEIVED",
      bd: bd.bd,
    });

    this.minisomMetaUploadContacts.execute({
      bd: bd.bd,
      email: bodyRequest.email,
      genId,
      leadId: bodyRequest.lead_id,
      name: bodyRequest.full_name,
      phoneNumber: normalizedPhoneNumber,
      contactList: this.CONTACTLIST,
      campaign: this.CAMPAIGN,
    });

    return {
      ...bodyRequest,
      genId,
      bd: bd.bd,
    };
  }
}
