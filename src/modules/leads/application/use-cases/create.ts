import { LeadIntegrationRepository } from "../../domain/repositories/lead-integration-repository";
import { LeadMappingRepository } from "../../domain/repositories/lead-mapping-repository";
import { CreateLeadIntegrationDTO } from "../../domain/dtos/create-lead-integration.dto";
import { CreateLeadMappingDTO } from "../../domain/dtos/create-lead-mapping.dto";

export interface CreateLeadConfigUseCaseDTO {
  lead: CreateLeadIntegrationDTO;
  mapping: Omit<CreateLeadMappingDTO, "lead_config_id">[];
}

export class CreateLeadConfigUseCase {
  constructor(
    private _leadIntegrationRepository: LeadIntegrationRepository,
    private _leadMappingRepository: LeadMappingRepository,
  ) {}

  async execute({ lead, mapping }: CreateLeadConfigUseCaseDTO) {
    const leadConfig = await this._leadIntegrationRepository.create(lead);

    const mappingsToSave = mapping.map((map) => ({
      ...map,
      lead_config_id: leadConfig.id,
      api_key: leadConfig.api_key,
    }));

    await this._leadMappingRepository.saveMany(leadConfig.id, mappingsToSave);

    return leadConfig;
  }
}
