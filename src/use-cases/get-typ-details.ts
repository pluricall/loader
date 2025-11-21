import { TypsRepository } from "../repositories/typs-repository";
import { NotFoundError } from "./errors/not-found-error";

export class GetTypDetailsUseCase {
  constructor(private prismaTypsRepository: TypsRepository) {}

  async execute(id: string) {
    const typ = await this.prismaTypsRepository.findById(id);

    if (!typ) {
      throw new NotFoundError("Typ not found.");
    }

    return { typ };
  }
}
