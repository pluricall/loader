import { ClientsRepository } from "../../repositories/clients-repository";
import { NotFoundError } from "../errors/not-found-error";

interface GetClientDetailsParams {
  clientId: string;
}

export class GetClientDetailsUseCase {
  constructor(private clientesRepository: ClientsRepository) {}

  async execute({ clientId }: GetClientDetailsParams) {
    const client = await this.clientesRepository.findById(clientId);

    if (!client) {
      throw new NotFoundError("Client not found.");
    }

    return { client };
  }
}
