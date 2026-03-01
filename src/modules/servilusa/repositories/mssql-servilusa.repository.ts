import sql from "mssql";
import {
  InsertAtServilusaLeadsRepository,
  ServilusaRepository,
} from "./servilusa.repository";
import { connectPluricallDb } from "../../../shared/infra/db/pluricall-db";

export class MssqlServilusaRepository implements ServilusaRepository {
  async insertAtServilusaLeadsRepository(
    data: InsertAtServilusaLeadsRepository,
  ): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");
    await conn
      .request()
      .input("lead_id", String(data.lead_id))
      .input("encuesta_id", String(data.encuesta_id))
      .input("gen_id", String(data.gen_id))
      .input("timestamp", timestamp)
      .input("request_ip", String(data.request_ip))
      .input("request_url", String(data.request_url))
      .input("campanha_easy", String(data.campanha_easy))
      .input("contact_list_easy", String(data.contact_list_easy))
      .input("plc_cod_bd_easy", String(data.plc_cod_bd_easy))
      .input("mapping_template", String(data.mapping_template))
      .input("raw_phone_number", String(data.raw_phone_number))
      .input("phone_number", String(data.phone_number))
      .input("email", String(data.email))
      .input("telefono", String(data.telefono))
      .input("lead_status", String(data.lead_status))
      .input("nif_cliente", String(data.nif_cliente))
      .input("codigo_centro", String(String(data.codigo_centro)))
      .input("codigo_campanya", String(String(data.codigo_campanya)))
      .input("codigo_oleada", String(String(data.codigo_oleada)))
      .input("codigo_interno_cliente", String(data.codigo_interno_cliente))
      .input("codigo_pregunta", String(String(data.codigo_pregunta)))
      .input("nombre_centro", String(data.nombre_centro))
      .input("nombre_encuestado", String(data.nombre_encuestado))
      .input("idioma", String(data.idioma))
      .input("fecha_crea", String(data.fecha_crea))
      .input("campo01", String(data.campo01))
      .input("campo02", String(data.campo02))
      .input("campo03", String(data.campo03))
      .input("campo04", String(data.campo04))
      .input("campo05", String(data.campo05))
      .input("campo06", String(data.campo06))
      .input("campo07", String(data.campo07))
      .input("campo08", String(data.campo08))
      .input("campo09", String(data.campo09))
      .input("campo10", String(data.campo10))
      .input("otrosdatos", String(data.otrosdatos))
      .input("observaciones", String(data.observaciones))
      .input("skey", String(data.skey))
      .input("formdata", String(data.formdata)).query(`
    INSERT INTO servilusa_leads_repository (
      lead_id,
      encuesta_id,
      gen_id,
      timestamp,
      request_ip,
      request_url,
      campanha_easy,
      contact_list_easy,
      plc_cod_bd_easy,
      mapping_template,
      raw_phone_number,
      phone_number,
      email,
      telefono,
      lead_status,
      nif_cliente,
      codigo_centro,
      codigo_campanya,
      codigo_oleada,
      codigo_interno_cliente,
      codigo_pregunta,
      nombre_centro,
      nombre_encuestado,
      idioma,
      fecha_crea,
      campo01,
      campo02,
      campo03,
      campo04,
      campo05,
      campo06,
      campo07,
      campo08,
      campo09,
      campo10,
      otrosdatos,
      observaciones,
      skey,
      formdata
    ) VALUES (
      @lead_id,
      @encuesta_id,
      @gen_id,
      @timestamp,
      @request_ip,
      @request_url,
      @campanha_easy,
      @contact_list_easy,
      @plc_cod_bd_easy,
      @mapping_template,
      @raw_phone_number,
      @phone_number,
      @email,
      @telefono,
      @lead_status,
      @nif_cliente,
      @codigo_centro,
      @codigo_campanya,
      @codigo_oleada,
      @codigo_interno_cliente,
      @codigo_pregunta,
      @nombre_centro,
      @nombre_encuestado,
      @idioma,
      @fecha_crea,
      @campo01,
      @campo02,
      @campo03,
      @campo04,
      @campo05,
      @campo06,
      @campo07,
      @campo08,
      @campo09,
      @campo10,
      @otrosdatos,
      @observaciones,
      @skey,
      @formdata
    )
  `);
  }

  async updateLeadStatus(
    genId: string | number,
    leadStatus: string,
  ): Promise<void> {
    const conn = await connectPluricallDb("onprem");

    await conn
      .request()
      .input("gen_id", sql.VarChar, String(genId))
      .input("lead_status", sql.VarChar, leadStatus).query(`
      UPDATE servilusa_leads_repository
      SET lead_status = @lead_status
      WHERE gen_id = @gen_id
    `);
  }
}
