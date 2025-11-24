import { PrismaTypsRepository } from "../../repositories/prisma/prisma-typs-repository";
import { UpdateTypUseCase } from "../typs/update-typ";

export function makeUpdateTypUseCase() {
  const typRepository = new PrismaTypsRepository();
  const updateTypUseCase = new UpdateTypUseCase(typRepository);

  return updateTypUseCase;
}
