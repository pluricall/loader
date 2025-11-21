import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { SearchClientsUseCase } from "../search-clients";

export function makeSearchClientsUseCase() {
  const clientsRepositories = new PrismaClientsRepository();
  const searchClientsUseCase = new SearchClientsUseCase(clientsRepositories);

  return searchClientsUseCase;
}
