import { MinisomRepository } from "../../repositories/minisom-repository";
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

export class MinisomCorporateUseCase {
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
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dataload = `${year}-${month}-${day}`;
    const formalizedNumber = this.normalizePhoneNumber(request.phone_number);
    const gen_id = this.uniqid();
    const contactList = "Net2026";
    const campaign = "MinisomExtNet";
    const language = "pt_PT";
    const originalBd = "IWEB25";
    const bd = this.resolveBdEasy(originalBd, request.adobe_campaign_code);
    const origem = "WEBSERVICE";
    const plc_id = this.generatePlcId();

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
            Name: "MobilePhone",
            Value: formalizedNumber,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "id_cliente",
            Value: gen_id,
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
            Value: `${origem} ${request.adobe_campaign_code}`,
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
            Value: language,
            IsAnonymized: false,
          },
          {
            discriminator: "DatabaseFields",
            Name: "bd",
            Value: bd,
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

    await this.minisomRepository.insertAtLeadsCorporateRepository({
      campaignName: campaign,
      marketing_consensus_flag: request.marketing_consensus_flag || "",
      privacy_consensus_flag: request.privacy_consensus_flag || "",
      name: request.name || "",
      form_title: request.form_title || "",
      surname: request.surname || "",
      adobe_campaign_code: request.adobe_campaign_code || "",
      free_message: request.free_message || "",
      type_of_request: request.type_of_request || "",
      utm_source: request.formData.utm_source || "",
      address: request.address || "",
      email: request.email || "",
      phone_number: formalizedNumber,
      raw_phone_number: request.phone_number,
      contactList,
      gen_id,
      request_ip: request.request_ip,
      request_url: request.request_url,
      origem,
      lead_status: "NEW PROCESS",
      bd,
      formData: request.formData,
      language,
    });
  }
}
