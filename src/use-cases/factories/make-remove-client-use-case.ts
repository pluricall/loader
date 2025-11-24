import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { RemoveClientUseCase } from "../clients/remove-client";

export function makeRemoveClientUseCase() {
  const prismaClientsRepositories = new PrismaClientsRepository();
  const removeClientUseCase = new RemoveClientUseCase(
    prismaClientsRepositories,
  );

  return removeClientUseCase;
}
