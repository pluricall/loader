import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { SearchClientsUseCase } from "../clients/search-clients";

export function makeSearchClientsUseCase() {
  const clientsRepositories = new PrismaClientsRepository();
  const searchClientsUseCase = new SearchClientsUseCase(clientsRepositories);

  return searchClientsUseCase;
}
