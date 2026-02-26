import sql from "mssql";
import { connectPluricallDb } from "../../db/pluricall-db";
import {
  InsertAtServilusaLeadsRepository,
  ServilusaRepository,
} from "../servilusa-repository";

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
      .input("lead_id", sql.VarChar, String(data.lead_id))
      .input("encuesta_id", sql.VarChar, String(data.encuesta_id))
      .input("gen_id", sql.VarChar, data.gen_id)
      .input("timestamp", sql.DateTime, timestamp)
      .input("request_ip", sql.VarChar, data.request_ip)
      .input("request_url", sql.VarChar, data.request_url)
      .input("campanha_easy", sql.VarChar, data.campanha_easy)
      .input("contact_list_easy", sql.VarChar, data.contact_list_easy)
      .input("plc_cod_bd_easy", sql.VarChar, data.plc_cod_bd_easy)
      .input("mapping_template", sql.VarChar, data.mapping_template)
      .input("raw_phone_number", sql.VarChar, data.raw_phone_number)
      .input("phone_number", sql.VarChar, data.phone_number)
      .input("email", sql.VarChar, data.email)
      .input("telefono", sql.VarChar, data.telefono)
      .input("lead_status", sql.VarChar, data.lead_status)
      .input("nif_cliente", sql.VarChar, data.nif_cliente)
      .input("codigo_centro", sql.VarChar, String(data.codigo_centro))
      .input("codigo_campanya", sql.VarChar, String(data.codigo_campanya))
      .input("codigo_oleada", sql.VarChar, String(data.codigo_oleada))
      .input("codigo_interno_cliente", sql.VarChar, data.codigo_interno_cliente)
      .input("codigo_pregunta", sql.VarChar, String(data.codigo_pregunta))
      .input("nombre_centro", sql.VarChar, data.nombre_centro)
      .input("nombre_encuestado", sql.VarChar, data.nombre_encuestado)
      .input("idioma", sql.VarChar, data.idioma)
      .input("fecha_crea", sql.VarChar, data.fecha_crea)
      .input("campo01", sql.VarChar, data.campo01)
      .input("campo02", sql.VarChar, data.campo02)
      .input("campo03", sql.VarChar, data.campo03)
      .input("campo04", sql.VarChar, data.campo04)
      .input("campo05", sql.VarChar, data.campo05)
      .input("campo06", sql.VarChar, data.campo06)
      .input("campo07", sql.VarChar, data.campo07)
      .input("campo08", sql.VarChar, data.campo08)
      .input("campo09", sql.VarChar, data.campo09)
      .input("campo10", sql.VarChar, data.campo10)
      .input("otrosdatos", sql.VarChar, data.otrosdatos)
      .input("observaciones", sql.VarChar, data.observaciones)
      .input("skey", sql.VarChar, data.skey)
      .input("formdata", sql.VarChar, JSON.stringify(data.formdata)).query(`
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
