import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import { generateGenId } from "../../../../shared/utils/generate-gen-id";
import { generateNormalizedPhonePT } from "../../../../shared/utils/generate-normalized-phone";
import { AgilidadeRepository } from "../../repositories/agilidade.repository";
import { Agilidade24041DTO } from "../../schemas/agilidade-24041.schema";
import { Agilidade24041UploadContactsUseCase } from "./upload-contacts.use-case";

export interface Agilidade24041Request {
  bodyRequest: Agilidade24041DTO;
  requestIp: string;
  requestUrl: string;
  token: string;
}

export class Agilidade24041UseCase {
  constructor(
    private agilidadeRepository: AgilidadeRepository,
    private agilidade24041UploadContacts: Agilidade24041UploadContactsUseCase,
  ) {}

  private API_KEY_LIVE = "GjAX34L3FayNAfgHNjNKmiMyebHo7L";
  private API_KEY_TEST = "fF7MBxxEJnD6884Db3mEtf6jBBo5cf";
  private CAMPAIGN = "agilidade_leads";

  async execute({
    bodyRequest,
    requestIp,
    requestUrl,
    token,
  }: Agilidade24041Request) {
    if (token !== this.API_KEY_LIVE && token !== this.API_KEY_TEST) {
      throw new UnauthorizedError("Unauthorized");
    }

    const contactListByApiKey =
      token === this.API_KEY_LIVE
        ? "AutoLoad_IMPROVEBYTECH"
        : "AutoLoad_TESTES";

    const genId = generateGenId();
    const normalizedPhoneNumber = generateNormalizedPhonePT(
      bodyRequest.telefone,
    );

    await this.agilidadeRepository.insertAtLeadsRepository({
      genId,
      requestIp,
      requestUrl,
      contactList: contactListByApiKey,
      rawPhoneNumber: bodyRequest.telefone,
      phoneNumber: normalizedPhoneNumber,
      nome: bodyRequest.nome || "",
      email: bodyRequest.email || "",
      leadId: bodyRequest.lead_id || "",
      distId: bodyRequest.dist_id || "",
      createdDate: bodyRequest.created_date || "",
      postedDate: bodyRequest.posted_date || "",
      city: bodyRequest.localidade || "",
      adId: bodyRequest.ad_id || "",
      adsetId: bodyRequest.adset_id || "",
      campaignId: bodyRequest.campaign_id || "",
      adName: bodyRequest.horario || "",
      campaignName: bodyRequest.marca || "",
      adsetName: bodyRequest.adset_name || "",
      formId: bodyRequest.form_id || "",
      formData: JSON.stringify(bodyRequest) || "",
      campanhaEasy: this.CAMPAIGN,
      bd: "UNKNOWN",
      mappingTemplate: "DEFAULT",
      leadStatus: "RECEIVED",
    });

    this.agilidade24041UploadContacts.execute({
      genId,
      contactList: contactListByApiKey,
      phoneNumber: normalizedPhoneNumber,
      nome: bodyRequest.nome || "",
      email: bodyRequest.email || "",
      lead_id: bodyRequest.lead_id || "",
      localidade: bodyRequest.localidade || "",
      ad_id: bodyRequest.ad_id || "",
      adset_id: bodyRequest.adset_id || "",
      campaign_id: bodyRequest.campaign_id || "",
      adset_name: bodyRequest.adset_name || "",
      created_date: bodyRequest.created_date || "",
      ad_name: bodyRequest.ad_name || "",
      campaign_name: bodyRequest.campaign_name || "",
      form_id: bodyRequest.form_id || "",
      campaignName: bodyRequest.campaign_name || "",
      campaign: this.CAMPAIGN,
    });

    return { status: "OK", statusMsg: "Lead loaded with success.", genId };
  }
}
