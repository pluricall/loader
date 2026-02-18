import { connectPluricallDb } from "../../db/pluricall-db";
import sql from "mssql";
import { LeadsRepository } from "../leads-repository";
import {
  AltitudeConfig,
  ClientLead,
  CreateClientDTO,
  FieldMapping,
  FieldMappingDTO,
  LeadLogDTO,
} from "../types/leads-repository";

export class MssqlLeadsRepository implements LeadsRepository {
  private poolPromise = connectPluricallDb();

  private async getPool() {
    return this.poolPromise;
  }

  async findClientByName(name: string): Promise<ClientLead | null> {
    const pool = await this.getPool();

    const result = await pool.request().input("name", name).query(`
        SELECT *
        FROM clients_leads_repository
        WHERE client_name = @name AND is_active = 1
      `);

    return result.recordset[0] ?? null;
  }

  async getAltitudeConfig(clientName: string): Promise<AltitudeConfig | null> {
    const pool = await this.getPool();

    const result = await pool.request().input("name", clientName).query(`
        SELECT *
        FROM clients_leads_config
        WHERE client_name = @name
      `);

    return result.recordset[0] ?? null;
  }

  async getFieldMapping(clientName: string): Promise<FieldMapping[]> {
    const pool = await this.getPool();

    const result = await pool.request().input("name", clientName).query(`
        SELECT source_field, altitude_field, is_required
        FROM clients_leads_mapping
        WHERE client_name = @name
        ORDER BY id
      `);

    return result.recordset;
  }

  async createClient(data: CreateClientDTO): Promise<void> {
    const pool = await this.getPool();

    await pool
      .request()
      .input("name", data.client_name)
      .input("api_key", data.api_key)
      .input("environment", data.environment)
      .input("is_active", data.is_active ?? true).query(`
        INSERT INTO clients_leads_repository
          (client_name, api_key, environment, is_active)
        VALUES
          (@name, @api_key, @environment, @is_active)
      `);
  }

  async saveConfig(data: AltitudeConfig): Promise<void> {
    const pool = await this.getPool();

    await pool
      .request()
      .input("client_name", data.client_name)
      .input("campaign", data.campaign_name)
      .input("contact_list", data.contact_list)
      .input("directory", data.directory_name)
      .input("timezone", data.timezone)
      .input("status", data.default_status)
      .input("dncl", data.uses_dncl).query(`
        MERGE clients_leads_config AS target
        USING (SELECT @client_name AS client_name) AS src
        ON target.client_name = src.client_name

        WHEN MATCHED THEN
          UPDATE SET
            campaign_name = @campaign,
            contact_list = @contact_list,
            directory_name = @directory,
            timezone = @timezone,
            default_status = @status,
            uses_dncl = @dncl

        WHEN NOT MATCHED THEN
          INSERT (
            client_name,
            campaign_name,
            contact_list,
            directory_name,
            timezone,
            default_status,
            uses_dncl
          )
          VALUES (
            @client_name,
            @campaign,
            @contact_list,
            @directory,
            @timezone,
            @status,
            @dncl
          );
      `);
  }

  async saveMapping(data: FieldMappingDTO[]): Promise<void> {
    if (!data.length) return;

    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      for (const row of data) {
        await new sql.Request(transaction)
          .input("client_name", row.client_name)
          .input("source", row.source_field)
          .input("altitude", row.altitude_field)
          .input("required", row.is_required).query(`
          MERGE clients_leads_mapping AS target
          USING (
            SELECT 
              @client_name AS client_name,
              @source AS source_field
          ) AS src
          ON target.client_name = src.client_name
             AND target.source_field = src.source_field

          WHEN MATCHED THEN
            UPDATE SET
              altitude_field = @altitude,
              is_required = @required

          WHEN NOT MATCHED THEN
            INSERT (
              client_name,
              source_field,
              altitude_field,
              is_required
            )
            VALUES (
              @client_name,
              @source,
              @altitude,
              @required
            );
        `);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async saveLog(log: LeadLogDTO): Promise<void> {
    const pool = await this.getPool();

    await pool
      .request()
      .input("client_name", log.client_name)
      .input("received", log.received_payload)
      .input("altitude_payload", log.altitude_payload)
      .input("altitude_response", log.altitude_response)
      .input("success", log.success)
      .input("error", log.error_message ?? null).query(`
        INSERT INTO clients_leads_logs (
          client_name,
          received_payload,
          altitude_payload,
          altitude_response,
          success,
          error_message
        )
        VALUES (
          @client_name,
          @received,
          @altitude_payload,
          @altitude_response,
          @success,
          @error
        )
      `);
  }

  async findClientByApiKey(apiKey: string) {
    const pool = await this.getPool();

    const result = await pool.request().input("api_key", apiKey).query(`
      SELECT *
      FROM clients_leads_repository
      WHERE api_key = @api_key
        AND is_active = 1
    `);

    return result.recordset[0] ?? null;
  }
}
