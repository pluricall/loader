import { Bds, BdType, Status } from "@prisma/client";
import { NotFoundError } from "../errors/not-found-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { ClientsRepository } from "../../repositories/clients-repository";
import { BdsRepository } from "../../repositories/bds-repository";

interface UpdateBdResponse {
  bd: Bds;
}

interface UpdateBdRequest {
  type?: BdType;
  status?: Status;
  user?: string;
  bdName?: string;
  origin?: string;
}

interface UpdateBdParams {
  clientId: string;
  bdId: string;
  data: UpdateBdRequest;
}

export class UpdateBdUseCase {
  constructor(
    private bdRepository: BdsRepository,
    private clientsRepository: ClientsRepository,
  ) {}

  async execute({
    clientId,
    bdId,
    data,
  }: UpdateBdParams): Promise<UpdateBdResponse> {
    const clientExists = await this.clientsRepository.findById(clientId);
    const bdExists = await this.bdRepository.findById(bdId);

    if (!clientExists) {
      throw new NotFoundError("Client not found.");
    }

    if (!bdExists) {
      throw new NotFoundError("Bd not found.");
    }

    if (clientExists.id !== bdExists.client_id) {
      throw new UnauthorizedError("That client doesn't belong to this bd");
    }

    const bd = await this.bdRepository.update(bdId, {
      type: data.type ?? bdExists.type,
      status: data.status ?? bdExists.status,
      user: data.user ?? bdExists.user,
      bd_name: data.bdName ?? bdExists.bd_name,
      origin: data.origin ?? bdExists.origin,
      updated_at: new Date(),
    });

    return { bd };
  }
}
