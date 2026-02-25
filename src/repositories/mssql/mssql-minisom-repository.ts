import sql from "mssql";
import { connectPluricallDb } from "../../db/pluricall-db";
import {
  InsertAtLeadsCorporateRepository,
  InsertAtLeadsRepository,
  MinisomFormConfig,
  MinisomRepository,
} from "../minisom-repository";

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

  async getBdByFormId(formId: string): Promise<MinisomFormConfig> {
    const conn = await connectPluricallDb("onprem");
    const result = await conn
      .request()
      .input("form_id", formId)
      .query(
        `SELECT id, bd, form_id, form_name, origin FROM minisom_forms_config WHERE form_id = @form_id`,
      );
    return result.recordset[0];
  }

  async insertAtLeadsRepository(data: InsertAtLeadsRepository): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").replace("Z", "");
    await conn
      .request()
      .input("lead_id", sql.VarChar, String(data.lead_id))
      .input("campaign", data.form_id)
      .input("email", data.email)
      .input("first_name", data.full_name)
      .input("raw_phone_number", data.phone_number)
      .input("phone_number", data.formalizedNumber)
      .input("campanha_easy", data.campaignName)
      .input("contact_list_easy", data.contactList)
      .input("formdata", JSON.stringify(data.formData))
      .input("timestamp", timestamp)
      .input("gen_id", data.genId)
      .input("request_ip", data.request_ip)
      .input("request_url", data.request_url)
      .input("origem", data.origem)
      .input("lead_status", data.lead_status)
      .input("bd_easy", data.bd)
      .input("utm_source", data.utm_source || null)
      .query(`INSERT INTO minisom_leads_repository (lead_id, campaign, email, first_name, raw_phone_number, phone_number,
         campanha_easy, contact_list_easy, formdata, timestamp, gen_id, request_ip, request_url, origem, lead_status, bd_easy, utm_source)
        VALUES (@lead_id, @campaign, @email, @first_name, @raw_phone_number, @phone_number,
         @campanha_easy, @contact_list_easy, @formdata, @timestamp, @gen_id, @request_ip, @request_url, @origem, @lead_status, @bd_easy, @utm_source)`);
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
}
