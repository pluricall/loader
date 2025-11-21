import { PrismaTypsRepository } from "../../repositories/prisma/prisma-typs-repository";
import { RemoveTypUseCase } from "../remove-typ";

export function makeRemoveTypUseCase() {
  const typRepository = new PrismaTypsRepository();
  const deleteTypUseCase = new RemoveTypUseCase(typRepository);

  return deleteTypUseCase;
}
