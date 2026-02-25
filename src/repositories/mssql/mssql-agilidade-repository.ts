// src/repositories/agilidade-repository.ts
import sql from "mssql";
import { connectPluricallDb } from "../../db/pluricall-db";
import {
  AgilidadeRepository,
  InsertAtAgilidadeLeadsRepository,
} from "../agilidade-repository";

export class MssqlAgilidadeRepository implements AgilidadeRepository {
  async insertAtLeadsRepository(
    data: InsertAtAgilidadeLeadsRepository,
  ): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").replace("Z", "");

    await conn
      .request()
      .input("timestamp", timestamp)
      .input("request_ip", data.request_ip)
      .input("request_url", data.request_url)
      .input("gen_id", data.gen_id)
      .input("campanha_easy", data.campanha_easy)
      .input("contact_list_easy", data.contact_list_easy)
      .input("bd_easy", data.bd_easy)
      .input("mapping_template", data.mapping_template)
      .input("raw_phone_number", data.raw_phone_number)
      .input("phone_number", data.phone_number)
      .input("lead_status", data.lead_status)
      .input("nome", data.nome)
      .input("email", data.email)
      .input("lead_id", data.lead_id)
      .input("dist_id", data.dist_id)
      .input("created_date", data.created_date)
      .input("posted_date", data.posted_date)
      .input("city", data.city)
      .input("ad_id", data.ad_id)
      .input("adset_id", data.adset_id)
      .input("campaign_id", data.campaign_id)
      .input("ad_name", data.ad_name)
      .input("campaign_name", data.campaign_name)
      .input("adset_name", data.adset_name)
      .input("form_id", data.form_id)
      .input("formdata", data.formdata).query(`
        INSERT INTO agilidade_leads_repository (
          timestamp,
          request_ip,
          request_url,
          gen_id,
          campanha_easy,
          contact_list_easy,
          bd_easy,
          mapping_template,
          raw_phone_number,
          phone_number,
          lead_status,
          nome,
          email,
          lead_id,
          dist_id,
          created_date,
          posted_date,
          city,
          ad_id,
          adset_id,
          campaign_id,
          ad_name,
          campaign_name,
          adset_name,
          form_id,
          formdata
        )
        VALUES (
          @timestamp,
          @request_ip,
          @request_url,
          @gen_id,
          @campanha_easy,
          @contact_list_easy,
          @bd_easy,
          @mapping_template,
          @raw_phone_number,
          @phone_number,
          @lead_status,
          @nome,
          @email,
          @lead_id,
          @dist_id,
          @created_date,
          @posted_date,
          @city,
          @ad_id,
          @adset_id,
          @campaign_id,
          @ad_name,
          @campaign_name,
          @adset_name,
          @form_id,
          @formdata
        )
      `);
  }

  async updateLeadStatus(gen_id: string, lead_status: string): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    await conn
      .request()
      .input("gen_id", sql.VarChar, gen_id)
      .input("lead_status", sql.VarChar, lead_status).query(`
        UPDATE agilidade_leads_repository
        SET lead_status = @lead_status
        WHERE gen_id = @gen_id
      `);
  }
}
