export interface CreateLeadMappingDTO {
  lead_config_id: number;
  source_field: string;
  altitude_field: string;
  is_required: boolean;
}
