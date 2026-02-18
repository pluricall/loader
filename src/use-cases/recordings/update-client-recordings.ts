import { MssqlRepository } from "../../repositories/mssql/mssql-pluricall-repository";
import { PluricallRepository } from "../../repositories/pluricall-repository";
import { NotFoundError } from "../errors/not-found-error";

export class UpdateClientStatusUseCase {
  constructor(
    private pumaRepository: PluricallRepository = new MssqlRepository(),
  ) {}

  async execute(clientName: string) {
    if (!clientName) throw new NotFoundError("Nome do cliente obrigatório");

    const updated = await this.pumaRepository.update(clientName);

    return updated;
  }
}
