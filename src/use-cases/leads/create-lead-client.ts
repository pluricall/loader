import { randomBytes } from "crypto";
import { LeadsRepository } from "../../repositories/leads-repository";
import { AlreadyExistsError } from "../errors/name-already-exists-error";

interface CreateLeadClientsRequest {
  clientName: string;
}

interface CreateLeadClientResponse {
  client_name: string;
  api_key: string;
}

export class CreateLeadClientUseCase {
  constructor(private leadsRepository: LeadsRepository) {}

  async execute({
    clientName,
  }: CreateLeadClientsRequest): Promise<CreateLeadClientResponse> {
    const exists = await this.leadsRepository.findClientByName(clientName);

    if (exists) {
      throw new AlreadyExistsError("Client already exists in leads");
    }

    const apiKey = "cli_" + randomBytes(24).toString("hex");

    await this.leadsRepository.createClient({
      client_name: clientName,
      api_key: apiKey,
      is_active: true,
    });

    return {
      client_name: clientName.trim().toUpperCase(),
      api_key: apiKey,
    };
  }
}
