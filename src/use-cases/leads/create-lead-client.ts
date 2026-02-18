import { randomBytes } from "crypto";
import { LeadsRepository } from "../../repositories/leads-repository";
import { AlreadyExistsError } from "../errors/name-already-exists-error";
import { AltitudeEnvironment } from "../../utils/resolve-altitude-config";

interface CreateLeadClientsRequest {
  clientName: string;
  environment: AltitudeEnvironment;
}

interface CreateLeadClientResponse {
  client_name: string;
  environment: AltitudeEnvironment;
  api_key: string;
}

export class CreateLeadClientUseCase {
  constructor(private leadsRepository: LeadsRepository) {}

  async execute({
    clientName,
    environment,
  }: CreateLeadClientsRequest): Promise<CreateLeadClientResponse> {
    const exists = await this.leadsRepository.findClientByName(clientName);

    if (exists) {
      throw new AlreadyExistsError("Client already exists in leads");
    }

    const apiKey = "cli_" + randomBytes(24).toString("hex");

    await this.leadsRepository.createClient({
      client_name: clientName,
      environment,
      api_key: apiKey,
      is_active: true,
    });

    return {
      client_name: clientName.trim().toUpperCase(),
      environment,
      api_key: apiKey,
    };
  }
}
