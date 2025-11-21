import { PrismaBdsRepository } from "../../repositories/prisma/prisma-bd-repository";
import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { SearchBdsUseCase } from "../search-bds";

export function makeSearchBdsUseCase() {
  const clientsRepository = new PrismaClientsRepository();
  const bdsRepository = new PrismaBdsRepository();
  const searchBdsUseCase = new SearchBdsUseCase(
    bdsRepository,
    clientsRepository,
  );

  return searchBdsUseCase;
}
