import sql from "mssql";
import {
  InsertAtLeadsCorporateRepository,
  InsertAtLeadsRepository,
  MinisomFormConfig,
  MinisomRepository,
} from "./minisom.repository";
import { connectPluricallDb } from "../../../shared/infra/db/pluricall-db";

export class MssqlMinisomRepository implements MinisomRepository {
  async verifyIfLeadIdExists(leadId: string | number): Promise<boolean> {
    const conn = await connectPluricallDb("onprem");
    const result = await conn
      .request()
      .input("lead_id", sql.VarChar, String(leadId))
      .query(
        `SELECT COUNT(*) as count FROM minisom_leads_repository WHERE lead_id = @lead_id`,
      );
    return result.recordset[0].count > 0;
  }

  async getBdByFormId(formId: any): Promise<MinisomFormConfig> {
    const conn = await connectPluricallDb("onprem");
    const result = await conn
      .request()
      .input("form_id", String(formId))
      .query(
        `SELECT id, bd, form_id, form_name, origin FROM minisom_forms_config WHERE form_id = @form_id`,
      );
    return result.recordset[0];
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
      UPDATE minisom_leads_repository
      SET lead_status = @lead_status
      WHERE gen_id = @gen_id
    `);
  }

  async updateCorporateLeadStatus(
    genId: string | number,
    leadStatus: string,
  ): Promise<void> {
    const conn = await connectPluricallDb("onprem");

    await conn
      .request()
      .input("gen_id", sql.VarChar, String(genId))
      .input("lead_status", sql.VarChar, leadStatus).query(`
      UPDATE minisom_corporate_leads_repository
      SET lead_status = @lead_status
      WHERE gen_id = @gen_id
    `);
  }

  async insertAtLeadsCorporateRepository(
    data: InsertAtLeadsCorporateRepository,
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
      .input("campanha_easy", data.campaignName)
      .input("contact_list_easy", data.contactList)
      .input("bd_easy", data.bd)
      .input("raw_phone_number", data.raw_phone_number)
      .input("phone_number", data.phone_number)
      .input("lead_status", data.lead_status)
      .input("name", data.name)
      .input("surname", data.surname)
      .input("email", data.email)
      .input("address", data.address)
      .input("type_of_request", data.type_of_request)
      .input("free_message", data.free_message)
      .input("privacy_consensus_flag", data.privacy_consensus_flag)
      .input("marketing_consensus_flag", data.marketing_consensus_flag)
      .input("form_title", data.form_title)
      .input("language", data.language)
      .input("adobe_campaign_code", data.adobe_campaign_code)
      .input("origem", data.origem)
      .input("formdata", JSON.stringify(data.formData)).query(`
      INSERT INTO minisom_corporate_leads_repository (
        timestamp,
        request_ip,
        request_url,
        gen_id,
        campanha_easy,
        contact_list_easy,
        bd_easy,
        raw_phone_number,
        phone_number,
        lead_status,
        name,
        surname,
        email,
        address,
        type_of_request,
        free_message,
        privacy_consensus_flag,
        marketing_consensus_flag,
        form_title,
        language,
        adobe_campaign_code,
        origem,
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
        @raw_phone_number,
        @phone_number,
        @lead_status,
        @name,
        @surname,
        @email,
        @address,
        @type_of_request,
        @free_message,
        @privacy_consensus_flag,
        @marketing_consensus_flag,
        @form_title,
        @language,
        @adobe_campaign_code,
        @origem,
        @formdata
      )
    `);
  }

  async insertAtLeadsRepository(data: InsertAtLeadsRepository): Promise<void> {
    try {
      const conn = await connectPluricallDb("onprem");
      const now = new Date();
      const timestamp = now.toISOString().replace("T", " ").replace("Z", "");
      const result = await conn
        .request()
        .input("timestamp", String(timestamp))
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
        .input("campaign", String(data.campaign))
        .input("lead_id", String(data.leadId))
        .input("dist_id", String(data.distId))
        .input("first_name", String(data.firstName))
        .input("last_name", String(data.lastName))
        .input("email", String(data.email))
        .input("created_date", String(data.createdDate))
        .input("posted_date", String(data.postedDate))
        .input("address", String(data.address))
        .input("city", String(data.city))
        .input("post_code", String(data.postCode))
        .input("site_id", String(data.siteId))
        .input("age", String(data.age))
        .input("dif_auditiva", String(data.difAuditiva))
        .input("origem", String(data.origem))
        .input("utm_source", String(data.utmSource))
        .input("notes1", String(data.notes1))
        .input("notes2", String(data.notes2))
        .input("notes3", String(data.notes3))
        .input("aut_dados", String(data.autDados))
        .input("score", String(data.score))
        .input("formdata", String(JSON.stringify(data.formData))).query(`
      INSERT INTO minisom_leads_repository (
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
        campaign,
        lead_id,
        dist_id,
        first_name,
        last_name,
        email,
        created_date,
        posted_date,
        address,
        city,
        post_code,
        site_id,
        age,
        dif_auditiva,
        origem,
        utm_source,
        notes1,
        notes2,
        notes3,
        aut_dados,
        score,
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
        @campaign,
        @lead_id,
        @dist_id,
        @first_name,
        @last_name,
        @email,
        @created_date,
        @posted_date,
        @address,
        @city,
        @post_code,
        @site_id,
        @age,
        @dif_auditiva,
        @origem,
        @utm_source,
        @notes1,
        @notes2,
        @notes3,
        @aut_dados,
        @score,
        @formdata
      )
    `);
      if (!result.rowsAffected || result.rowsAffected[0] !== 1) {
        throw new Error("Lead was not inserted");
      }
    } catch (error: any) {
      console.error("CRITICAL - insertAtLeadsRepository failed:", error);
      throw error;
    }
  }
}
