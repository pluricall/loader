import { connectPluricallDb } from "../../db/pluricall-db";
import {
  IberdrolaRepository,
  InsertAnswerParams,
  SendedMessagesParams,
  WebhookPdfResponse,
  WebhookSmsResponse,
} from "../iberdrola-repository";

export class MssqlIberdrolaRepository implements IberdrolaRepository {
  async sendedMessages(data: SendedMessagesParams): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    await conn
      .request()
      .input("contract_id", data.contractId)
      .input("phone_number", data.phoneNumber)
      .input("message", data.message)
      .input("easycode", data.easycode)
      .input("campaign", data.campaign)
      .input("response_status", "PENDING")
      .query(
        `INSERT INTO iberdrola_sms_send_log (contract_id, phone_number, message, easycode, campaign, response_status) VALUES (@contract_id, @phone_number, @message, @easycode, @campaign, @response_status)`,
      );
  }

  async insertAnswer(data: InsertAnswerParams) {
    const conn = await connectPluricallDb("onprem");
    await conn
      .request()
      .input("rawId", data.contractId)
      .input("hostedNumber", data.phoneNumber)
      .input("messageBody", data.response)
      .input("status", data.status)
      .query(
        `INSERT INTO iberdrola_sms_inbox_log (rawId, hostedNumber, messageBody) 
       VALUES (@rawId, @hostedNumber, @messageBody, @status)`,
      );
  }

  async webhookPdfResponse(data: WebhookPdfResponse): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    await conn
      .request()
      .input("ref_tsa", data.ref_tsa)
      .input("cert_type", data.cert_type)
      .input("mo", data.mo)
      .input("mt", data.mt)
      .input("mt_id", data.mt_id)
      .input("event", data.event)
      .input("lang", data.lang)
      .input("src", data.src)
      .input("dst", data.dst).query(`
        INSERT INTO iberdrola_sms_webhook
        (ref_tsa, cert_type, mo, mt, mt_id, event, lang, src, dst)
        VALUES
        (@ref_tsa, @cert_type, @mo, @mt, @mt_id, @event, @lang, @src, @dst)
      `);
  }

  async webhookSmsResponse(data: WebhookSmsResponse): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    await conn
      .request()
      .input("fecha", data.fecha)
      .input("udh", data.udh)
      .input("texto", data.texto)
      .input("idmo", data.idmo)
      .input("esm_class", data.esm_class)
      .input("destino", data.destino)
      .input("data_coding", data.data_coding)
      .input("origen", data.origen).query(`
        INSERT INTO iberdrola_sms_mo
        (fecha, udh, texto, idmo, esm_class, destino, data_coding, origen)
        VALUES
        (@fecha, @udh, @texto, @idmo, @esm_class, @destino, @data_coding, @origen)
      `);

    await conn
      .request()
      .input("rawId", data.texto)
      .input("hostedNumber", data.destino.replace(/^\+351/, ""))
      .input("senderNumber", data.origen.replace(/^\+351/, "")).query(`
        INSERT INTO iberdrola_sms_inbox_log
        (rawId, hostedNumber, senderNumber)
        VALUES
        (@rawId, @hostedNumber, @senderNumber)
      `);
  }
}
