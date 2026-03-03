import { Clients, Status, Frequency } from "@prisma/client";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { AlreadyExistsError } from "../../shared/errors/name-already-exists-error";
import { ClientsRepository } from "../../repositories/clients-repository";

interface UpdateClientsRequest {
  clientName?: string;
  status?: Status;
  contactDpo?: string | null;
  contactExDto?: string | null;
  infoExDto?: string | null;
  owner?: string;
  ftpPath?: string;
  recordingDevolution?: Frequency;
}

interface UpdateClientsResponse {
  clients: Clients;
}

export class UpdateClientsUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(
    clientId: string,
    data: UpdateClientsRequest,
  ): Promise<UpdateClientsResponse> {
    const existingClient = await this.clientsRepository.findById(clientId);

    if (!existingClient) {
      throw new NotFoundError("Client not found.");
    }

    if (data.clientName && data.clientName !== existingClient.client) {
      const nameAlreadyExists = await this.clientsRepository.findByName(
        data.clientName as string,
      );

      if (nameAlreadyExists && nameAlreadyExists.id !== clientId) {
        throw new AlreadyExistsError("Client name already exists.");
      }
    }

    const updatedData = {
      client: data.clientName ?? existingClient.client,
      status: data.status ?? existingClient.status,
      contact_dpo: data.contactDpo ?? existingClient.contact_dpo,
      contact_ex_dto: data.contactExDto ?? existingClient.contact_ex_dto,
      info_ex_dto: data.infoExDto ?? existingClient.info_ex_dto,
      owner: data.owner ?? existingClient.owner,
      ftp_path: data.ftpPath ?? existingClient.ftp_path,
      recording_devolution:
        data.recordingDevolution ?? existingClient.recording_devolution,
      updated_at: new Date(),
    };

    const clients = await this.clientsRepository.update(clientId, updatedData);

    return { clients };
  }
}
