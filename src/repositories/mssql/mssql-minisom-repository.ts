import sql from "mssql";
import { connectPluricallDb } from "../../db/pluricall-db";
import {
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
      .input("utm_source", data.utm_source || null)
      .query(`INSERT INTO minisom_leads_repository (lead_id, campaign, email, first_name, raw_phone_number, phone_number,
         campanha_easy, contact_list_easy, formdata, timestamp, gen_id, request_ip, request_url, origem, lead_status, utm_source)
        VALUES (@lead_id, @campaign, @email, @first_name, @raw_phone_number, @phone_number,
         @campanha_easy, @contact_list_easy, @formdata, @timestamp, @gen_id, @request_ip, @request_url, @origem, @lead_status, @utm_source)`);
  }
}
