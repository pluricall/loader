import { LeopardRepository } from "../../repositories/mssql/mssql-leopard-repository";
import { MssqlRepository } from "../../repositories/mssql/mssql-pluricall-repository";
import { FetchRecordingsUseCase } from "../recordings/fetch-recordings";

export function makeFetchRecordingsUseCase() {
  const mssqlRepository = new MssqlRepository();
  const leopardRepository = new LeopardRepository();
  const fetchRecordingsUseCase = new FetchRecordingsUseCase(
    mssqlRepository,
    leopardRepository,
  );

  return fetchRecordingsUseCase;
}
