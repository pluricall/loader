import { MinisomRepository } from "../../repositories/minisom-repository";
import { generateDataload } from "../../utils/generate-dataload";
import { generateGenId } from "../../utils/generate-gen-id";
import { generateNormalizedPhone } from "../../utils/generate-normalized-phone";
import { generatePlcId } from "../../utils/generate-plc-id";
import { AltitudeCreateContact } from "../altitude/create-contact";

export interface MinisomCorporateRequest {
  adobe_campaign_code: string;
  email: string;
  form_title: string;
  marketing_consensus_flag: string;
  name: string;
  surname: string;
  phone_number: string;
  privacy_consensus_flag: string;
  address?: string;
  free_message?: string;
  type_of_request?: string;
  request_ip: string;
  request_url: string;
  formData: Record<string, any>;
}

export class MinisomCorporateUseCaseOfc {
  constructor(
    private minisomRepository: MinisomRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  currentYear = new Date().getFullYear();
  private CAMPAIGN = "MinisomExtNet";
  private CONTACTLIST = `Net${this.currentYear}`;
  private ORIGEM = "WEBSERVICE";
  private LANGUAGE = "pt_PT";

  private readonly GSB_CODES = [
    "PTSEM102PPXHA00",
    "PTSEM102PGO9ANI",
    "PTSEM102PIHTANI",
    "PTSEM102P2JHA00",
    "PTSEM102PLESA00",
    "PTSEM102PYRBA00",
    "PTSEM102PMQIA00",
    "PTSEM102PEUAA00",
    "PTSEM102PAB5A00",
    "PTSEM102PIEHA00",
    "PTSEM102PGO9AN",
    "PTSEM102PCRXA00",
    "PTSEM102PB3HA00",
  ];

  private readonly GSG_CODES = [
    "PTSEM102PHYAANI",
    "PTSEM102PPVWANI",
    "PTSEM102PPGMANI",
    "PTSEM102PPIWANI",
    "PTSEM102PHEOANI",
    "PTSEM102PXK4ANI",
    "PTSEM102PCZNANI",
    "PTSEM102PDMDANI",
    "PTSEM102P59XANI",
    "PTSEM102PSWCANI",
    "PTSEM102PPL2ANI",
    "PTSEM102POF8ANI",
    "PTSEM102PBLIANI",
    "PTSEM102PFGHANI",
    "PTSEM102P4VTANI",
    "PTSEM102P2OYA00",
    "PTSEM102PJJYA00",
    "PTSEM102PJ0PA00",
    "PTSEM102P4X1A00",
    "PTSEM102PLNAA00",
    "PTSEM102P1FUA00",
    "PTSEM102P5AYA00",
    "PTSEM102PVDHA00",
    "PTSEM102PGKMA00",
    "PTSEM102PAMWA00",
    "PTSEM102PYZYA00",
    "PTSEM102P20SA00",
    "PTSEM102PO0QA00",
    "PTSEM102PJW2A00",
    "PTSEM102P1N0A00",
    "PTSEM102P9NKA00",
    "PTSEM102PV2DA00",
    "PTSEM102PU1DA00",
    "PTSEM102POJ9A00",
    "PTSEM102PZZDA00",
    "PTSEM102PYOQA00",
  ];

  private resolveBdEasy(originalBd: string, adobeCampaignCode: string): string {
    if (originalBd !== "IWEB25") {
      return originalBd;
    }

    if (adobeCampaignCode.startsWith("PTPMX")) {
      return "IWEPMX";
    }

    if (this.GSB_CODES.some((code) => adobeCampaignCode.includes(code))) {
      return "IWEGSB";
    }

    if (this.GSG_CODES.some((code) => adobeCampaignCode.includes(code))) {
      return "IWEGSG";
    }

    return "IWEOTH";
  }

  async execute(request: MinisomCorporateRequest) {
    const normalizedPhoneNumber = generateNormalizedPhone(request.phone_number);
    const originalBd = "IWEB25";
    const bd = this.resolveBdEasy(originalBd, request.adobe_campaign_code);
    const gen_id = generateGenId();

    await this.minisomRepository.insertAtLeadsCorporateRepository({
      campaignName: this.CAMPAIGN,
      marketing_consensus_flag: request.marketing_consensus_flag || "",
      privacy_consensus_flag: request.privacy_consensus_flag || "",
      name: request.name || "",
      surname: request.surname || "",
      form_title: request.form_title || "",
      adobe_campaign_code: request.adobe_campaign_code || "",
      free_message: request.free_message || "",
      type_of_request: request.type_of_request || "",
      utm_source: request.formData.utm_source || "",
      address: request.address || "",
      email: request.email || "",
      phone_number: normalizedPhoneNumber,
      raw_phone_number: request.phone_number,
      contactList: this.CONTACTLIST,
      gen_id,
      request_ip: request.request_ip,
      request_url: request.request_url,
      origem: this.ORIGEM,
      lead_status: "RECEIVED",
      bd,
      formData: request.formData,
      language: this.LANGUAGE,
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
          ContactListName: { RequestType: "Set", Value: this.CONTACTLIST },
          Attributes: [
            {
              discriminator: "DatabaseFields",
              Name: "MobilePhone",
              Value: normalizedPhoneNumber,
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "id_cliente",
              Value: request.gen_id,
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
              Value: `${request.name} ${request.surname}`.trim(),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "HomeStreet",
              Value: request.address || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "Manager",
              Value: request.privacy_consensus_flag || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "Assistant",
              Value: request.marketing_consensus_flag || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "realizou_exame_tempo",
              Value: `${this.ORIGEM} ${request.adobe_campaign_code}`,
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "BusinessStreet",
              Value: request.form_title,
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "PreferredLanguage",
              Value: request.language,
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
      await this.minisomRepository.updateCorporateLeadStatus(
        request.gen_id,
        "LOADED",
      );
    } catch (err) {
      console.error(
        "Erro em processAsync para gen_id",
        request.gen_id,
        ":",
        err,
      );
      await this.minisomRepository.updateCorporateLeadStatus(
        request.gen_id,
        "ERROR",
      );
    }
  }
}
