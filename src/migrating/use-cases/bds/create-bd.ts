import { Bds, BdType, Status } from "@prisma/client";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { randomBytes } from "crypto";
import { ClientsRepository } from "../../repositories/clients-repository";
import { BdsRepository } from "../../repositories/bds-repository";

interface CreateBdResponse {
  bd: Bds;
}

interface CreateBdRequest {
  type: BdType;
  status: Status;
  user: string;
  bdName: string;
  origin: string;
}

export class CreateBdUseCase {
  constructor(
    private bdRepository: BdsRepository,
    private clientsRepository: ClientsRepository,
  ) {}

  async execute(
    clientId: string,
    data: CreateBdRequest,
  ): Promise<CreateBdResponse> {
    const clientExists = await this.clientsRepository.findById(clientId);

    if (!clientExists) {
      throw new NotFoundError("Client not found.");
    }

    const randomCode = randomBytes(3).toString("hex").toUpperCase();

    const bd = await this.bdRepository.create(clientId, {
      code: randomCode,
      type: data.type,
      status: data.status,
      user: data.user,
      bd_name: data.bdName,
      origin: data.origin,
    });

    return { bd };
  }
}
