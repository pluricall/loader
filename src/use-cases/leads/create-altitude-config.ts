import { LeadsRepository } from "../../repositories/leads-repository";
import { AltitudeConfig } from "../../repositories/types/leads-repository";
import { NotFoundError } from "../errors/not-found-error";

export class CreateAltitudeConfigUseCase {
  constructor(private leadsRepository: LeadsRepository) {}

  async execute(config: AltitudeConfig) {
    const client = await this.leadsRepository.findClientByName(
      config.client_name,
    );

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    await this.leadsRepository.saveConfig(config);

    return { success: true };
  }
}
