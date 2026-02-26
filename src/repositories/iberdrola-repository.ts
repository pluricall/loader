export interface SendedMessagesParams {
  contractId: string;
  phoneNumber: string;
  message: string;
  campaign: string;
  easycode: string;
}

export interface InsertAnswerParams {
  contractId: string;
  response: string;
  phoneNumber: string;
  senderNumber: string;
  receivedAt: string | Date;
}

export interface SearchPendingsResponse {
  id: number;
  contractId: string;
  phoneNumber: string;
  message: string;
  campaign: string;
  easycode: string;
}

export interface WebhookPdfResponse {
  ref_tsa: string;
  cert_type: string;
  mo: number;
  mt: number;
  mt_id: string;
  event: string;
  lang: string;
  src: string;
  dst: string;
}

export interface WebhookSmsResponse {
  fecha: string;
  udh: string;
  texto: string;
  idmo: string;
  esm_class: string;
  destino: string;
  data_coding: string;
  origen: string;
}

export interface IberdrolaRepository {
  sendedMessages: (data: SendedMessagesParams) => void;
  insertAnswer: (data: InsertAnswerParams) => void;
  webhookPdfResponse: (data: WebhookPdfResponse) => void;
}
