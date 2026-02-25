import { MinisomRepository } from "../../repositories/minisom-repository";
import { generateDataload } from "../../utils/generate-dataload";
import { generateGenId } from "../../utils/generate-gen-id";
import { generateNormalizedPhone } from "../../utils/generate-normalized-phone";
import { generatePlcId } from "../../utils/generate-plc-id";
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

  currentYear = new Date().getFullYear();
  private AUTH_KEY = "HRCecRJ3V30EXxO9QkESpKGV";
  private CAMPAIGN = "MinisomExtNet";
  private CONTACTLIST = `Net${this.currentYear}`;
  private ORIGEM = "WEBSERVICE";

  async execute(request: Minisom21051Request) {
    const gen_id = generateGenId();
    if (request.auth_key !== this.AUTH_KEY || !request.bd) {
      return {
        status: "error",
        status_msg: "Invalid Authorization Key or Missing BD",
        gen_id: "",
      };
    }

    const normalizedPhoneNumber = generateNormalizedPhone(request.phone_number);

    const duplicatedLead = await this.minisomRepository.verifyIfLeadIdExists(
      request.lead_id,
    );

    if (duplicatedLead) {
      throw new AlreadyExistsError("Lead ID já existe");
    }

    await this.minisomRepository.insertAtLeadsRepository({
      lead_id: request.lead_id,
      form_id: request.form_id || "",
      email: request.email,
      full_name: `${request.first_name} ${request.last_name || ""}`.trim(),
      raw_phone_number: request.phone_number,
      phone_number: normalizedPhoneNumber,
      campaignName: this.CAMPAIGN,
      contactList: this.CONTACTLIST,
      formData: request,
      gen_id,
      request_ip: request.request_ip,
      request_url: request.request_url,
      origem: this.ORIGEM,
      lead_status: "RECEIVED",
      utm_source: request.utm_source,
      bd: request.bd,
    });

    return { status: "OK", status_msg: "", gen_id };
  }

  async processAsync(request: any) {
    try {
      const dataload = generateDataload();
      const plc_id = generatePlcId();
      const normalizedPhoneNumber = generateNormalizedPhone(
        request.phone_number,
      );

      const payload = {
        campaignName: this.CAMPAIGN,
        contactCreateRequest: {
          Status: "Started",
          ContactListName: {
            RequestType: "Set",
            Value: this.CONTACTLIST,
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
              Value: `${this.ORIGEM} ${request.utm_source || ""}`,
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

      await this.minisomRepository.updateLeadStatus(request.gen_id, "LOADED");
    } catch (err) {
      console.error(
        "Erro em processAsync para gen_id",
        request.gen_id,
        ":",
        err,
      );
      await this.minisomRepository.updateLeadStatus(request.gen_id, "ERROR");
    }
  }
}
