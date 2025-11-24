import { PrismaBdsRepository } from "../../repositories/prisma/prisma-bd-repository";
import { PrismaClientsRepository } from "../../repositories/prisma/prisma-clients-repository";
import { GetBdDetailsUseCase } from "../bds/get-bd-details";

export function makeGetBdDetailsUseCase() {
  const prismaBdRepository = new PrismaBdsRepository();
  const prismaClientsRepository = new PrismaClientsRepository();
  const getBdDetailsUseCase = new GetBdDetailsUseCase(
    prismaBdRepository,
    prismaClientsRepository,
  );

  return getBdDetailsUseCase;
}
