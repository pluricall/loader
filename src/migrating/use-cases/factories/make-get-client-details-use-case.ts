import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { GetClientDetailsUseCase } from "../clients/get-client-details";

export function makeGetClientDetailsUseCase() {
  const prismaClientsRepositories = new PrismaClientsRepository();
  const getClientDetailsUseCase = new GetClientDetailsUseCase(
    prismaClientsRepositories,
  );

  return getClientDetailsUseCase;
}
