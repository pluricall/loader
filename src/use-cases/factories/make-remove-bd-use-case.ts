import { PrismaBdsRepository } from "../../repositories/prisma/prisma-bd-repository";
import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { RemoveBdUseCase } from "../remove-bd";

export function makeRemoveBdUseCase() {
  const prismaClientsRepositories = new PrismaClientsRepository();
  const prismaBdsRepositories = new PrismaBdsRepository();
  const removeClientUseCase = new RemoveBdUseCase(
    prismaBdsRepositories,
    prismaClientsRepositories,
  );

  return removeClientUseCase;
}
