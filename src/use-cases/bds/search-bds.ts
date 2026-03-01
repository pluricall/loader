import { Bds } from "@prisma/client";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { ClientsRepository } from "../../repositories/clients-repository";
import { BdsRepository } from "../../repositories/bds-repository";

interface SearchBdsRequest {
  clientId: string;
}

interface SearchBdsResponse {
  bds: Bds[];
}

export class SearchBdsUseCase {
  constructor(
    private bdRepository: BdsRepository,
    private clientsRepository: ClientsRepository,
  ) {}

  async execute({ clientId }: SearchBdsRequest): Promise<SearchBdsResponse> {
    const client = await this.clientsRepository.findById(clientId);

    if (!client) {
      throw new NotFoundError("Client not found.");
    }

    const bds = await this.bdRepository.searchMany(clientId);

    return { bds };
  }
}
