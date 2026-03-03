import { PrismaTypsRepository } from "../../repositories/prisma/prisma-typs-repository";
import { RemoveTypUseCase } from "../typs/remove-typ";

export function makeRemoveTypUseCase() {
  const typRepository = new PrismaTypsRepository();
  const deleteTypUseCase = new RemoveTypUseCase(typRepository);

  return deleteTypUseCase;
}
