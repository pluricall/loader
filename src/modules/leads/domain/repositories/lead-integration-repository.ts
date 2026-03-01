import { LeadIntegration } from "../entities/lead-integration";
import { CreateLeadIntegrationDTO } from "../dtos/create-lead-integration.dto";
import { AltitudeEnvironment } from "../../../../shared/utils/resolve-altitude-config";

export interface LeadIntegrationRepository {
  create(data: CreateLeadIntegrationDTO): Promise<LeadIntegration>;
  findByApiKey(apiKey: string): Promise<LeadIntegration | null>;
  findByNameAndContactList(
    campaignName: string,
    contactList: string,
    environment: AltitudeEnvironment,
  ): Promise<LeadIntegration | null>;
}
