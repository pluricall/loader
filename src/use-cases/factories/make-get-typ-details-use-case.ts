import { PrismaTypsRepository } from "../../repositories/prisma/prisma-typs-repository";
import { GetTypDetailsUseCase } from "../get-typ-details";

export function makeGetTypDetailsUseCase() {
  const prismaTypRepository = new PrismaTypsRepository();
  const getTypDetailsUseCase = new GetTypDetailsUseCase(prismaTypRepository);

  return getTypDetailsUseCase;
}
