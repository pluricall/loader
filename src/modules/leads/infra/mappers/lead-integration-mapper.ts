import { LeadIntegration } from "../../domain/entities/lead-integration";
import { LeadIntegrationRow } from "../types/lead-integration-row";

export class LeadIntegrationMapper {
  static toDomain(raw: LeadIntegrationRow): LeadIntegration {
    return {
      id: raw.id,
      client_name: raw.client_name,
      environment: raw.environment,
      api_key: raw.api_key,
      campaign_name: raw.campaign_name,
      contact_list: raw.contact_list,
      directory_name: raw.directory_name,
      timezone: raw.timezone,
      default_status: raw.default_status,
      uses_dncl: Boolean(raw.uses_dncl),
      is_active: Boolean(raw.is_active),
      created_at: raw.created_at,
    };
  }
}
