import { TypsRepository } from "../../repositories/typs-repository";
import { NotFoundError } from "../../shared/errors/not-found-error";

interface RemoveTypRequest {
  typId: string;
}

export class RemoveTypUseCase {
  constructor(private prismaTypsRepository: TypsRepository) {}

  async execute({ typId }: RemoveTypRequest) {
    const typ = await this.prismaTypsRepository.findById(typId);
    if (!typ) {
      throw new NotFoundError("Typ not found!");
    }

    return await this.prismaTypsRepository.remove(typId);
  }
}
