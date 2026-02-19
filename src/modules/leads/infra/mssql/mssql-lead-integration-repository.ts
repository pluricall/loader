import { randomBytes } from "crypto";
import { connectPluricallDb } from "../../../../db/pluricall-db";
import { CreateLeadIntegrationDTO } from "../../domain/dtos/create-lead-integration.dto";
import { LeadIntegration } from "../../domain/entities/lead-integration";
import { LeadIntegrationRepository } from "../../domain/repositories/lead-integration-repository";
import { LeadIntegrationMapper } from "../mappers/lead-integration-mapper";
import { LeadIntegrationRow } from "../types/lead-integration-row";

export class MssqlLeadIntegrationRepository
  implements LeadIntegrationRepository
{
  private poolPromise = connectPluricallDb();

  private async getPool() {
    return this.poolPromise;
  }

  async create(data: CreateLeadIntegrationDTO): Promise<LeadIntegration> {
    const pool = await this.getPool();
    const apiKey = "cli_" + randomBytes(24).toString("hex");

    const result = await pool
      .request()
      .input("client_name", data.client_name)
      .input("api_key", apiKey)
      .input("environment", data.environment)
      .input("campaign_name", data.campaign_name)
      .input("contact_list", data.contact_list)
      .input("directory_name", data.directory_name)
      .input("timezone", data.timezone)
      .input("default_status", data.default_status)
      .input("uses_dncl", data.uses_dncl).query<LeadIntegrationRow>(`
    INSERT INTO leads_config (
      client_name,
      api_key,
      environment,
      campaign_name,
      contact_list,
      directory_name,
      timezone,
      default_status,
      uses_dncl
    )
    OUTPUT inserted.*
    VALUES (
      @client_name,
      @api_key,
      @environment,
      @campaign_name,
      @contact_list,
      @directory_name,
      @timezone,
      @default_status,
      @uses_dncl
    )
  `);

    return LeadIntegrationMapper.toDomain(result.recordset[0]);
  }

  async findByApiKey(apiKey: string): Promise<LeadIntegration | null> {
    const pool = await this.getPool();

    const result = await pool.request().input("api_key", apiKey)
      .query<LeadIntegrationRow>(`
      SELECT *
      FROM leads_config
      WHERE api_key = @api_key
        AND is_active = 1
    `);

    const record = result.recordset[0];
    if (!record) return null;

    return LeadIntegrationMapper.toDomain(record);
  }

  async findById(id: number): Promise<LeadIntegration | null> {
    const pool = await this.getPool();

    const result = await pool.request().input("id", id)
      .query<LeadIntegrationRow>(`
      SELECT *
      FROM leads_config
      WHERE id = @id AND is_active = 1
    `);

    const record = result.recordset[0];
    if (!record) return null;

    return LeadIntegrationMapper.toDomain(record);
  }
}
