import { PrismaBdsRepository } from "../../repositories/prisma/prisma-bd-repository";
import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { CreateBdUseCase } from "../create-bd";

export function makeCreateBdUseCase() {
  const prismaClientesRepository = new PrismaClientsRepository();
  const prismaBdRepository = new PrismaBdsRepository();
  const registerBdsUseCase = new CreateBdUseCase(
    prismaBdRepository,
    prismaClientesRepository,
  );

  return registerBdsUseCase;
}
