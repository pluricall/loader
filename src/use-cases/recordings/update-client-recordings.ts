import { MssqlPluricallRepository } from "../../repositories/mssql/mssql-pluricall-repository";
import { PluricallRepository } from "../../repositories/pluricall-repository";
import { NotFoundError } from "../../shared/errors/not-found-error";

export class UpdateClientStatusUseCase {
  constructor(
    private pumaRepository: PluricallRepository = new MssqlPluricallRepository(),
  ) {}

  async execute(clientName: string) {
    if (!clientName) throw new NotFoundError("Nome do cliente obrigatório");

    const updated = await this.pumaRepository.update(clientName);

    return updated;
  }
}
