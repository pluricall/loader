import { LeadIntegrationRepository } from "../../domain/repositories/lead-integration-repository";
import { LeadMappingRepository } from "../../domain/repositories/lead-mapping-repository";
import { CreateLeadIntegrationDTO } from "../../domain/dtos/create-lead-integration.dto";
import { CreateLeadMappingDTO } from "../../domain/dtos/create-lead-mapping.dto";
import { ValidationError } from "../../../../use-cases/errors/validation-error";
import { AlreadyExistsError } from "../../../../use-cases/errors/name-already-exists-error";

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
    if (!mapping || mapping.length === 0) {
      throw new ValidationError("At least one mapping is required");
    }

    const clientNameAndContactListExists =
      await this._leadIntegrationRepository.findByNameAndContactList(
        lead.campaign_name,
        lead.contact_list,
        lead.environment,
      );

    if (clientNameAndContactListExists) {
      throw new AlreadyExistsError(
        "This campaign and contact list already exists",
      );
    }

    const {
      id: lead_config_id,
      api_key,
      client_name,
    } = await this._leadIntegrationRepository.create(lead);

    const mappingsToSave = mapping.map((map) => ({
      ...map,
      lead_config_id,
      api_key,
    }));

    await this._leadMappingRepository.saveMany(lead_config_id, mappingsToSave);

    return { clientName: client_name };
  }
}
