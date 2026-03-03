import { Clients } from "@prisma/client";
import { ClientsRepository } from "../../repositories/clients-repository";
import { NotFoundError } from "../../../shared/errors/not-found-error";

interface RemoveClientRequest {
  clientId: string;
}

interface RemoveClientResponse {
  client: Clients;
}

export class RemoveClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    clientId,
  }: RemoveClientRequest): Promise<RemoveClientResponse> {
    const client = await this.clientsRepository.findById(clientId);

    if (!client) {
      throw new NotFoundError("Client not found.");
    }

    const removedClient = await this.clientsRepository.remove(clientId);
    return { client: removedClient };
  }
}
