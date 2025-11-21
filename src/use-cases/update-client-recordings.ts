import { PumaRepositoryImpl } from "../repositories/mssql/puma-repository-impl";
import { NotFoundError } from "./errors/not-found-error";

export class UpdateClientStatusUseCase {
  constructor(
    private pumaRepository: PumaRepositoryImpl = new PumaRepositoryImpl(),
  ) {}

  async execute(clientName: string) {
    if (!clientName) throw new NotFoundError("Nome do cliente obrigatório");

    const updated = await this.pumaRepository.updateStatus(clientName);

    return updated;
  }
}
