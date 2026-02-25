export interface InsertAtAgilidadeLeadsRepository {
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
  formdata?: string;
  request_ip?: string;
  request_url?: string;
  gen_id: string;
  campanha_easy: string;
  contact_list_easy: string;
  bd_easy: string;
  mapping_template: string;
  raw_phone_number?: string;
  phone_number?: string;
  lead_status: string;
}

export interface AgilidadeRepository {
  insertAtLeadsRepository: (
    data: InsertAtAgilidadeLeadsRepository,
  ) => Promise<void>;
  updateLeadStatus: (gen_id: string, lead_status: string) => Promise<void>;
}
