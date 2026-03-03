import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { CreateClientUseCase } from "../clients/create-client";

export function makeCreateClientUseCase() {
  const prismaClientsRepository = new PrismaClientsRepository();
  const createClientsUseCase = new CreateClientUseCase(prismaClientsRepository);

  return createClientsUseCase;
}
