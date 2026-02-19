export interface LeadIntegration {
  id: number;
  client_name: string;
  environment: string;
  api_key: string;
  campaign_name: string;
  contact_list: string;
  directory_name: string;
  timezone: string;
  default_status: string;
  uses_dncl: boolean;
  is_active: boolean;
  created_at: string;
}
