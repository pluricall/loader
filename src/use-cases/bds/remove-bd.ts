import { Bds } from "@prisma/client";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { ClientsRepository } from "../../repositories/clients-repository";
import { BdsRepository } from "../../repositories/bds-repository";

interface RemoveBdRequest {
  clientId: string;
  bdId: string;
}

interface RemoveBdResponse {
  bd: Bds;
}

export class RemoveBdUseCase {
  constructor(
    private bdRepository: BdsRepository,
    private clientsRepository: ClientsRepository,
  ) {}

  async execute({
    clientId,
    bdId,
  }: RemoveBdRequest): Promise<RemoveBdResponse> {
    const client = await this.clientsRepository.findById(clientId);
    const bd = await this.bdRepository.findById(bdId);

    if (!client) {
      throw new NotFoundError("Client not found.");
    }

    if (!bd) {
      throw new NotFoundError("BD not found for this client.");
    }

    const removedBd = await this.bdRepository.remove(bdId);
    return { bd: removedBd };
  }
}
