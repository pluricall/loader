export interface InsertAtServilusaLeadsRepository {
  id?: number | null;
  timestamp: Date;
  request_ip: string;
  request_url: string;
  gen_id: string;
  campanha_easy: string;
  contact_list_easy: string;
  plc_cod_bd_easy: string;
  mapping_template: string;
  raw_phone_number: string;
  phone_number: string | null;
  lead_status: string;
  lead_id: string | number;
  encuesta_id: string | number;
  nif_cliente: string;
  codigo_centro: string | number;
  codigo_campanya: string | number;
  codigo_oleada: string | number;
  codigo_interno_cliente: string;
  codigo_pregunta: string | number;
  nombre_centro: string;
  email: string;
  telefono: string | null;
  nombre_encuestado: string;
  idioma: string;
  fecha_crea: string;
  campo01: string;
  campo02: string;
  campo03: string;
  campo04: string;
  campo05: string;
  campo06: string;
  campo07: string;
  campo08: string;
  campo09: string;
  campo10: string;
  otrosdatos: string;
  observaciones: string;
  skey: string;
  formdata: object;
}

export interface ServilusaRepository {
  insertAtServilusaLeadsRepository: (
    data: InsertAtServilusaLeadsRepository,
  ) => void;
  updateLeadStatus: (
    gen_id: string | number,
    lead_status: string,
  ) => Promise<void>;
}
