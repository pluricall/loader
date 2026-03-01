// src/repositories/agilidade-repository.ts
import sql from "mssql";
import { connectPluricallDb } from "../../../shared/infra/db/pluricall-db";
import {
  AgilidadeRepository,
  InsertAtAgilidadeLeadsRepository,
} from "./agilidade.repository";

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
      .input("request_ip", String(data.requestIp))
      .input("request_url", String(data.requestUrl))
      .input("gen_id", String(data.genId))
      .input("campanha_easy", String(data.campanhaEasy))
      .input("contact_list_easy", String(data.contactList))
      .input("bd_easy", String(data.bd))
      .input("mapping_template", String(data.mappingTemplate))
      .input("raw_phone_number", String(data.rawPhoneNumber))
      .input("phone_number", String(data.phoneNumber))
      .input("lead_status", String(data.leadStatus))
      .input("nome", String(data.nome))
      .input("email", String(data.email))
      .input("lead_id", String(data.leadId))
      .input("dist_id", String(data.distId))
      .input("created_date", String(data.createdDate))
      .input("posted_date", String(data.postedDate))
      .input("city", String(data.city))
      .input("ad_id", String(data.adId))
      .input("adset_id", String(data.adsetId))
      .input("campaign_id", String(data.campaignId))
      .input("ad_name", String(data.adName))
      .input("campaign_name", String(data.campaignName))
      .input("adset_name", String(data.adsetName))
      .input("form_id", String(data.formId))
      .input("formdata", String(data.formData)).query(`
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
formdata,
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
