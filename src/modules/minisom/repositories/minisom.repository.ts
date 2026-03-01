export interface InsertAtLeadsRepository {
  requestIp: any;
  requestUrl: any;
  genId: any;
  campanhaEasy: any;
  contactList: any;
  bd: any;
  mappingTemplate: any;
  rawPhoneNumber: any;
  phoneNumber: any;
  leadStatus: any;
  campaign: any;
  leadId: any;
  distId: any;
  firstName: any;
  lastName: any;
  email: any;
  createdDate: any;
  postedDate: any;
  address: any;
  city: any;
  postCode: any;
  siteId: any;
  age: any;
  difAuditiva: any;
  origem: any;
  utmSource: any;
  notes1: any;
  notes2: any;
  notes3: any;
  autDados: any;
  score: any;
  formData: any;
}

export interface InsertAtLeadsCorporateRepository {
  email: string;
  origem: string;
  formData: Record<string, any>;
  adobe_campaign_code: string;
  form_title: string;
  privacy_consensus_flag: string;
  marketing_consensus_flag: string;
  free_message: string;
  type_of_request: string;
  address: string;
  name: string;
  surname: string;
  lead_status: string;
  utm_source?: string;
  phone_number: string;
  raw_phone_number: string;
  bd: string;
  contactList: string;
  campaignName: string;
  gen_id: string;
  request_ip: string;
  request_url: string;
  language: string;
}

export interface MinisomFormConfig {
  id: number;
  bd: string;
  form_id: string;
  form_name: string;
  origin: string;
}

export interface MinisomRepository {
  getBdByFormId: (formId: string) => Promise<MinisomFormConfig>;
  insertAtLeadsRepository: (data: InsertAtLeadsRepository) => void;
  verifyIfLeadIdExists: (lead_id: string | number) => Promise<boolean>;
  insertAtLeadsCorporateRepository: (
    data: InsertAtLeadsCorporateRepository,
  ) => void;
  updateLeadStatus: (
    gen_id: string | number,
    lead_status: string,
  ) => Promise<void>;
  updateCorporateLeadStatus: (
    gen_id: string | number,
    lead_status: string,
  ) => Promise<void>;
}
