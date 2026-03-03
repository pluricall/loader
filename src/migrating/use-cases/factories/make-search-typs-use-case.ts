import { PrismaTypsRepository } from "../../repositories/prisma/prisma-typs-repository";
import { SearchTypsUseCase } from "../typs/search-typs";

export function makeSearchTypsUseCase() {
  const prismaTypsRepository = new PrismaTypsRepository();
  const searchTypsUseCase = new SearchTypsUseCase(prismaTypsRepository);

  return searchTypsUseCase;
}
