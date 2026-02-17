export interface ClientLead {
  client_name: string;
  api_key: string;
  is_active: boolean;
}

export interface AltitudeConfig {
  client_name: string;
  campaign_name: string;
  contact_list: string;
  directory_name: string;
  timezone: string;
  default_status: string;
  uses_dncl: boolean;
}

export interface FieldMapping {
  source_field: string;
  altitude_field: string;
  is_required: boolean;
}

export interface CreateClientDTO {
  client_name: string;
  api_key: string;
  is_active?: boolean;
}

export interface FieldMappingDTO extends FieldMapping {
  client_name: string;
}

export interface LeadLogDTO {
  client_name: string;
  received_payload: string;
  altitude_payload: string;
  altitude_response: string | null;
  success: boolean;
  error_message?: string;
}
