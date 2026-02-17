import { LeadsRepository } from "../../repositories/leads-repository";
import { NotFoundError } from "../errors/not-found-error";

export class SearchLeadClientsUseCase {
  constructor(private leadsRepository: LeadsRepository) {}

  async execute(clientName: string) {
    const client = await this.leadsRepository.findClientByName(clientName);

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    const config = await this.leadsRepository.getAltitudeConfig(clientName);
    const mapping = await this.leadsRepository.getFieldMapping(clientName);

    return {
      client,
      config,
      mapping,
    };
  }
}
