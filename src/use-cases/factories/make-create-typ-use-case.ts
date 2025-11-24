import { PrismaTypsRepository } from "../../repositories/prisma/prisma-typs-repository";
import { CreateTypUseCase } from "../typs/create-typ";

export function makeCreateTypUseCase() {
  const typRepository = new PrismaTypsRepository();
  const createTypUseCase = new CreateTypUseCase(typRepository);

  return createTypUseCase;
}
