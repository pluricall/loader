import { TypsRepository } from "../repositories/typs-repository";

export class SearchTypsUseCase {
  constructor(private prismaTypsRepository: TypsRepository) {}

  async execute() {
    const typs = await this.prismaTypsRepository.searchMany();

    return { typs };
  }
}
