// src/repositories/agilidade-repository.ts
import { connectPluricallDb } from "../../../../shared/infra/db/pluricall-db";
import { IAgilidadeRepository } from "../../domain/repositories/agilidade-repository";
import { AgilidadeLead } from "../../domain/entities/lead";
import { AgilidadeMapper } from "../mappers/agilidade-mapper";

export class AgilidadeMssqlRepository implements IAgilidadeRepository {
  async save(
    lead: AgilidadeLead,
    requestIp: string,
    requestUrl: string,
  ): Promise<void> {
    const record = AgilidadeMapper.toPersistence(lead, requestIp, requestUrl);
    const conn = await connectPluricallDb("onprem");

    await conn
      .request()
      .input("timestamp", record.timestamp)
      .input("request_ip", record.request_ip)
      .input("request_url", record.request_url)
      .input("gen_id", record.gen_id)
      .input("campanha_easy", record.campanha_easy)
      .input("contact_list_easy", record.contact_list_easy)
      .input("bd_easy", record.bd_easy)
      .input("mapping_template", record.mapping_template)
      .input("raw_phone_number", record.raw_phone_number)
      .input("phone_number", record.phone_number)
      .input("lead_status", record.lead_status)
      .input("nome", record.nome)
      .input("email", record.email)
      .input("lead_id", record.lead_id)
      .input("dist_id", record.dist_id)
      .input("created_date", record.created_date)
      .input("posted_date", record.posted_date)
      .input("city", record.city)
      .input("ad_id", record.ad_id)
      .input("adset_id", record.adset_id)
      .input("campaign_id", record.campaign_id)
      .input("ad_name", record.ad_name)
      .input("campaign_name", record.campaign_name)
      .input("adset_name", record.adset_name)
      .input("form_id", record.form_id)
      .input("formdata", String(record.formdata)).query(`
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

  async updateStatus(gen_id: string, lead_status: string): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    await conn
      .request()
      .input("gen_id", gen_id)
      .input("lead_status", lead_status).query(`
        UPDATE agilidade_leads_repository
        SET lead_status = @lead_status
        WHERE gen_id = @gen_id
      `);
  }
}
