import { NotFoundError } from "../../../shared/errors/not-found-error";
import { ClientsRepository } from "../../repositories/clients-repository";

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
