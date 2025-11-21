import { ClientsRepository } from "../repositories/clients-repository";

export class SearchClientsUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute() {
    const clients = await this.clientsRepository.searchMany();
    return { clients };
  }
}
