import { PrismaBdsRepository } from "../../repositories/prisma/prisma-bd-repository";
import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { UpdateBdUseCase } from "../update-bd";

export function makeUpdateBdUseCase() {
  const prismaBdRepository = new PrismaBdsRepository();
  const prismaClientesRepository = new PrismaClientsRepository();
  const updateBdUseCase = new UpdateBdUseCase(
    prismaBdRepository,
    prismaClientesRepository,
  );

  return updateBdUseCase;
}
