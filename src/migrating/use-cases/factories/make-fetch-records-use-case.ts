import { LeopardRepository } from "../../repositories/mssql/mssql-leopard-repository";
import { MssqlPluricallRepository } from "../../repositories/mssql/mssql-pluricall-repository";
import { FetchRecordingsUseCase } from "../recordings/fetch-recordings";

export function makeFetchRecordingsUseCase() {
  const mssqlRepository = new MssqlPluricallRepository();
  const leopardRepository = new LeopardRepository();
  const fetchRecordingsUseCase = new FetchRecordingsUseCase(
    mssqlRepository,
    leopardRepository,
  );

  return fetchRecordingsUseCase;
}
