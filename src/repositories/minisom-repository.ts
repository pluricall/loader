export interface InsertAtLeadsRepository {
  lead_id: string;
  form_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  formalizedNumber: string;
  campaignName: string;
  contactList: string;
  formData: Record<string, any>;
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
  verifyIfLeadIdExists: (lead_id: string) => Promise<boolean>;
}
