export interface LeadLogsDTO {
  lead_config_id: number;
  received_payload: string;
  altitude_payload: string;
  altitude_response: string | null;
  success: boolean;
  error_message?: string;
}
