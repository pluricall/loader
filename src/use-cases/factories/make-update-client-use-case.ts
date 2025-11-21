import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { UpdateClientsUseCase } from "../update-client";

export function makeUpdateClientUseCase() {
  const prismaClientsRepositories = new PrismaClientsRepository();
  const updateClientUseCase = new UpdateClientsUseCase(
    prismaClientsRepositories,
  );

  return updateClientUseCase;
}
