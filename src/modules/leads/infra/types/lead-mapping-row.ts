export interface LeadMappingRow {
  id: number;
  lead_config_id: number;
  source_field: string;
  altitude_field: string;
  is_required: number;
  is_phone_number: number;
  created_at: string;
}
