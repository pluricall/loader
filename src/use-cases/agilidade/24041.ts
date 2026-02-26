import { generateGenId } from "../../utils/generate-gen-id";
import { generateNormalizedPhone } from "../../utils/generate-normalized-phone";
import { AgilidadeRepository } from "../../repositories/agilidade-repository";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { generateDataload } from "../../utils/generate-dataload";
import { AltitudeCreateContact } from "../altitude/create-contact";

export interface AgilidadeRequest {
  nome: string;
  telefone: string;
  lead_id?: string;
  email?: string;
  dataEntrada?: string;
  dataPedido?: string;
  localidade?: string;
  marca?: string;
  horario?: string;
  ad_id?: string;
  adset_id?: string;
  campaign_id?: string;
  adset_name?: string;
  dist_id?: string;
  created_date?: string;
  posted_date?: string;
  city?: string;
  ad_name?: string;
  campaign_name?: string;
  form_id?: string;
}

export interface Agilidade24041Request {
  request: AgilidadeRequest;
  request_ip: string;
  request_url: string;
  token: string;
  formdata: Record<string, any>;
}

export interface AgilidadeUploadContactRequest {
  campaignName: string;
  contactList: string;
  phoneNumber: string;
  nome: string;
  gen_id: string;
  email?: string;
  lead_id?: string;
  localidade?: string;
  ad_id?: string;
  adset_id?: string;
  campaign_id?: string;
  adset_name?: string;
  created_date?: string;
  ad_name?: string;
  campaign_name?: string;
  form_id?: string;
}

export class Agilidade24041UseCase {
  constructor(
    private agilidadeRepository: AgilidadeRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  private API_KEY_LIVE = "GjAX34L3FayNAfgHNjNKmiMyebHo7L";
  private API_KEY_TEST = "fF7MBxxEJnD6884Db3mEtf6jBBo5cf";
  private CAMPAIGN = "agilidade_leads";

  async execute({
    request,
    request_ip,
    request_url,
    token,
    formdata,
  }: Agilidade24041Request) {
    if (token !== this.API_KEY_LIVE && token !== this.API_KEY_TEST) {
      throw new UnauthorizedError("Unauthorized");
    }

    const contactList =
      token === this.API_KEY_LIVE
        ? "AutoLoad_IMPROVEBYTECH"
        : "AutoLoad_TESTES";

    const gen_id = generateGenId();
    const normalizedPhoneNumber = generateNormalizedPhone(request.telefone);

    await this.agilidadeRepository.insertAtLeadsRepository({
      gen_id,
      contact_list_easy: contactList,
      campanha_easy: this.CAMPAIGN,
      request_ip,
      request_url,
      raw_phone_number: request.telefone,
      phone_number: normalizedPhoneNumber,
      nome: request.nome,
      email: request.email,
      lead_id: request.lead_id,
      dist_id: request.dist_id,
      created_date: request.created_date,
      posted_date: request.posted_date,
      city: request.localidade,
      ad_id: request.ad_id,
      adset_id: request.adset_id,
      campaign_id: request.campaign_id,
      ad_name: request.horario,
      campaign_name: request.marca,
      adset_name: request.adset_name,
      form_id: request.form_id,
      formdata: JSON.stringify(formdata),
      bd_easy: "UNKNOWN",
      mapping_template: "DEFAULT",
      lead_status: "RECEIVED",
    });

    return {
      request,
      gen_id,
      contactList,
      normalizedPhoneNumber,
      campaignName: this.CAMPAIGN,
    };
  }

  async uploadContact({
    campaignName,
    contactList,
    phoneNumber,
    email,
    nome,
    gen_id,
    lead_id,
    localidade,
    ad_id,
    adset_id,
    campaign_id,
    adset_name,
    created_date,
    ad_name,
    campaign_name,
    form_id,
  }: AgilidadeUploadContactRequest) {
    try {
      const dataload = generateDataload();

      const payload = {
        campaignName,
        contactCreateRequest: {
          Status: "Started",
          ContactListName: {
            RequestType: "Set",
            Value: contactList,
          },
          Attributes: [
            {
              discriminator: "requestbaseFields",
              Name: "HomePhone",
              Value: phoneNumber,
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "telefone",
              Value: phoneNumber,
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "enderecoemail",
              Value: email || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "nome",
              Value: nome || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "FirstName",
              Value: nome || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "localidade",
              Value: localidade || "",
              IsAnonymized: false,
            },

            {
              discriminator: "requestbaseFields",
              Name: "bd_id",
              Value: lead_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_created_time",
              Value: created_date || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_ad_id",
              Value: ad_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_ad_name",
              Value: ad_name || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_adset_id",
              Value: adset_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_adset_name",
              Value: adset_name || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_campaign_id",
              Value: campaign_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_campaign_name",
              Value: campaign_name || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_form_id",
              Value: form_id || "",
              IsAnonymized: false,
            },

            {
              discriminator: "requestbaseFields",
              Name: "plc_id",
              Value: gen_id,
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "dataload",
              Value: dataload,
              IsAnonymized: false,
            },
          ],
        },
      };

      await this.altitudeCreateContact.execute({
        environment: "onprem",
        payload,
      });

      await this.agilidadeRepository.updateLeadStatus(gen_id, "LOADED");
    } catch (err) {
      await this.agilidadeRepository.updateLeadStatus(gen_id, "ERROR");
    }
  }
}
