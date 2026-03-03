// src/repositories/agilidade-repository.ts
import sql from "mssql";
import { connectPluricallDb } from "../../../shared/infra/db/pluricall-db";
import {
  AgilidadeRepository,
  InsertAtAgilidadeLeadsRepository,
} from "./agilidade.repository";

export class MssqlAgilidadeRepository implements AgilidadeRepository {
  private truncate(value: any, max: number): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    return str.length > max ? str.slice(0, max) : str;
  }

  async insertAtLeadsRepository(
    data: InsertAtAgilidadeLeadsRepository,
  ): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").replace("Z", "");

    await conn
      .request()
      .input("timestamp", timestamp)
      .input("request_ip", this.truncate(data.requestIp, 50))
      .input("request_url", this.truncate(data.requestUrl, 300))
      .input("gen_id", this.truncate(data.genId, 70))
      .input("campanha_easy", this.truncate(data.campanhaEasy, 30))
      .input("contact_list_easy", this.truncate(data.contactList, 50))
      .input("bd_easy", this.truncate(data.bd, 30))
      .input("mapping_template", this.truncate(data.mappingTemplate, 150))
      .input("raw_phone_number", this.truncate(data.rawPhoneNumber, 50))
      .input("phone_number", this.truncate(data.phoneNumber, 14))
      .input("lead_status", this.truncate(data.leadStatus, 100))
      .input("nome", this.truncate(data.nome, 120))
      .input("email", this.truncate(data.email, 180))
      .input("lead_id", this.truncate(data.leadId, 70))
      .input("dist_id", this.truncate(data.distId, 70))
      .input("created_date", this.truncate(data.createdDate, 80))
      .input("posted_date", this.truncate(data.postedDate, 80))
      .input("city", this.truncate(data.city, 80))
      .input("ad_id", this.truncate(data.adId, 200))
      .input("adset_id", this.truncate(data.adsetId, 200))
      .input("campaign_id", this.truncate(data.campaignId, 200))
      .input("ad_name", this.truncate(data.adName, 200))
      .input("campaign_name", this.truncate(data.campaignName, 200))
      .input("adset_name", this.truncate(data.adsetName, 200))
      .input("form_id", this.truncate(data.formId, 200))
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
