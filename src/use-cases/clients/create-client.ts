import { Status, Clients, Frequency } from "@prisma/client";
import { AlreadyExistsError } from "../errors/name-already-exists-error";
import { ClientsRepository } from "../../repositories/clients-repository";

interface CreateClientsResponse {
  clients: Clients;
}

interface CreateClientsRequest {
  id?: string;
  clientName: string;
  status: Status;
  contactDpo?: string | null;
  contactExDto?: string | null;
  infoExDto?: string | null;
  owner: string;
  ftpPath: string;
  recordingDevolution?: Frequency;
  createdAt?: Date | string;
  updatedAt?: Date | string | null;
}

export class CreateClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(data: CreateClientsRequest): Promise<CreateClientsResponse> {
    const clientNameAlreadyExists = await this.clientsRepository.findByName(
      data.clientName,
    );

    if (clientNameAlreadyExists) {
      throw new AlreadyExistsError("Client name already exists.");
    }

    const clients = await this.clientsRepository.create({
      client: data.clientName,
      status: data.status,
      contact_dpo: data.contactDpo,
      contact_ex_dto: data.contactExDto,
      info_ex_dto: data.infoExDto,
      owner: data.owner,
      ftp_path: data.ftpPath,
      recording_devolution: data.recordingDevolution,
    });

    return { clients };
  }
}
