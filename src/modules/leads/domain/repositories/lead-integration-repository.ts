import { LeadIntegration } from "../entities/lead-integration";
import { CreateLeadIntegrationDTO } from "../dtos/create-lead-integration.dto";

export interface LeadIntegrationRepository {
  create(data: CreateLeadIntegrationDTO): Promise<LeadIntegration>;
  findByApiKey(apiKey: string): Promise<LeadIntegration | null>;
  findById(id: number): Promise<LeadIntegration | null>;
}
