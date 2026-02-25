export interface InsertAtLeadsRepository {
  lead_id: string | number;
  form_id: string | number;
  email: string;
  full_name: string;
  phone_number: string;
  formalizedNumber: string;
  campaignName: string;
  contactList: string;
  formData: Record<string, any>;
  genId: string;
  request_ip: string;
  request_url: string;
  origem: string;
  lead_status: string;
  utm_source?: string;
  bd: string;
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
}
