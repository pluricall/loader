import { MinisomRepository } from "../../repositories/minisom-repository";
import { generateDataload } from "../../utils/generate-dataload";
import { generateGenId } from "../../utils/generate-gen-id";
import { generateNormalizedPhone } from "../../utils/generate-normalized-phone";
import { generatePlcId } from "../../utils/generate-plc-id";
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

  currentYear = new Date().getFullYear();
  private CAMPAIGN = "MinisomExtNet";
  private CONTACTLIST = `Net${this.currentYear}`;
  private ORIGEM = "FACEBOOK";

  async execute(request: MinisomMetaRequest) {
    const normalizedPhoneNumber = generateNormalizedPhone(request.phone_number);
    const gen_id = generateGenId();

    const bd = await this.minisomRepository.getBdByFormId(request.form_id);
    if (!bd) throw new NotFoundError("BD não encontrada");

    const duplicatedLead = await this.minisomRepository.verifyIfLeadIdExists(
      request.lead_id,
    );

    if (duplicatedLead) {
      throw new AlreadyExistsError("Lead ID já existe");
    }

    this.minisomRepository.insertAtLeadsRepository({
      lead_id: request.lead_id,
      form_id: request.form_id,
      email: request.email,
      full_name: request.full_name,
      raw_phone_number: request.phone_number,
      phone_number: normalizedPhoneNumber,
      campaignName: this.CAMPAIGN,
      contactList: this.CONTACTLIST,
      formData: request.formData,
      gen_id,
      request_ip: request.request_ip,
      request_url: request.request_url,
      origem: this.ORIGEM,
      lead_status: "RECEIVED",
      bd: bd.bd,
    });

    return {
      ...request,
      gen_id,
      bd: bd.bd,
    };
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
              Value: request.full_name,
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
