import { CreateLeadMappingDTO } from "../dtos/create-lead-mapping.dto";
import { LeadMapping } from "../entities/lead-mapping";

export interface LeadMappingRepository {
  saveMany(
    leadConfigId: number,
    mappings: CreateLeadMappingDTO[],
  ): Promise<void>;
  findByLeadConfigId(leadConfigId: number): Promise<LeadMapping[]>;
}
