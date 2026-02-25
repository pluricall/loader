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
}
