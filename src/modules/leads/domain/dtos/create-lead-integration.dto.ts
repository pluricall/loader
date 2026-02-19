import { AltitudeEnvironment } from "../../../../utils/resolve-altitude-config";

export interface CreateLeadIntegrationDTO {
  client_name: string;
  environment: AltitudeEnvironment;
  campaign_name: string;
  contact_list: string;
  directory_name: string;
  timezone: string;
  default_status: string;
  uses_dncl: boolean;
}
