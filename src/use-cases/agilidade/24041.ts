import { generateDataload } from "../../utils/generate-dataload";
import { generateGenId } from "../../utils/generate-gen-id";
import { generateNormalizedPhone } from "../../utils/generate-normalized-phone";
import { AltitudeCreateContact } from "../altitude/create-contact";
import { AgilidadeRepository } from "../../repositories/agilidade-repository";
import { UnauthorizedError } from "../errors/unauthorized-error";

export interface Agilidade24041Request {
  lead_id?: string;
  nome?: string;
  telefone?: string;
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
  formdata?: Record<string, any>;
  request_ip?: string;
  request_url?: string;
  token?: string;
}

export class Agilidade24041UseCase {
  constructor(
    private agilidadeRepository: AgilidadeRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  private API_KEY_LIVE = "GjAX34L3FayNAfgHNjNKmiMyebHo7L";
  private API_KEY_TEST = "fF7MBxxEJnD6884Db3mEtf6jBBo5cf";
  private CAMPAIGN = "agilidade_leads";

  async execute(request: Agilidade24041Request) {
    if (
      request.token !== this.API_KEY_LIVE &&
      request.token !== this.API_KEY_TEST
    ) {
      throw new UnauthorizedError("Unauthorized");
    }

    const contactList =
      request.token === this.API_KEY_LIVE
        ? "AutoLoad_IMPROVEBYTECH"
        : "AutoLoad_TESTES";

    const gen_id = generateGenId();
    const normalizedPhoneNumber = generateNormalizedPhone(request.telefone);

    await this.agilidadeRepository.insertAtLeadsRepository({
      request_ip: request.request_ip,
      request_url: request.request_url,
      gen_id,
      contact_list_easy: contactList,
      campanha_easy: this.CAMPAIGN,
      bd_easy: "UNKNOWN",
      mapping_template: "DEFAULT",
      lead_status: "RECEIVED",
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
      formdata: JSON.stringify(request.formdata),
    });

    return { status: "OK", status_msg: "", gen_id };
  }

  async processAsync(request: any) {
    try {
      const dataload = generateDataload();
      const normalizedPhoneNumber = generateNormalizedPhone(request.telefone);

      const payload = {
        campaignName: this.CAMPAIGN,
        contactCreateRequest: {
          Status: "Started",
          ContactListName: {
            RequestType: "Set",
            Value: request.contactList,
          },
          Attributes: [
            {
              discriminator: "requestbaseFields",
              Name: "HomePhone",
              Value: normalizedPhoneNumber,
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "HomePhone",
              Value: normalizedPhoneNumber,
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "enderecoemail",
              Value: request.email || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "nome",
              Value: request.nome || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "FirstName",
              Value: request.nome || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "localidade",
              Value: request.city || "",
              IsAnonymized: false,
            },

            {
              discriminator: "requestbaseFields",
              Name: "bd_id",
              Value: request.lead_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_created_time",
              Value: request.created_date || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_ad_id",
              Value: request.ad_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_ad_name",
              Value: request.ad_name || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_adset_id",
              Value: request.adset_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_adset_name",
              Value: request.adset_name || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_campaign_id",
              Value: request.campaign_id || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_campaign_name",
              Value: request.campaign_name || "",
              IsAnonymized: false,
            },
            {
              discriminator: "requestbaseFields",
              Name: "bd_form_id",
              Value: request.form_id || "",
              IsAnonymized: false,
            },

            {
              discriminator: "requestbaseFields",
              Name: "plc_id",
              Value: request.gen_id,
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

      await this.agilidadeRepository.updateLeadStatus(request.gen_id, "LOADED");
    } catch (err) {
      console.error(
        "Erro em processAsync para gen_id",
        request.gen_id,
        ":",
        err,
      );
      await this.agilidadeRepository.updateLeadStatus(request.gen_id, "ERROR");
    }
  }
}
