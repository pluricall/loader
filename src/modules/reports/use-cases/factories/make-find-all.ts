import { MssqlReportsRepository } from "../../repositories/mssql/relatorios.repository";
import { FindAllReportsUseCase } from "../find-all";

export function makeFindAllReportsUseCase() {
  const repository = new MssqlReportsRepository();

  return new FindAllReportsUseCase(repository);
}
