import { LeadMapping } from "../../domain/entities/lead-mapping";
import { LeadMappingRow } from "../types/lead-mapping-row";

export class LeadMappingMapper {
  static toDomain(raw: LeadMappingRow): LeadMapping {
    return {
      id: raw.id,
      lead_config_id: raw.lead_config_id,
      source_field: raw.source_field,
      altitude_field: raw.altitude_field,
      is_required: Boolean(raw.is_required),
      created_at: raw.created_at,
    };
  }
}
