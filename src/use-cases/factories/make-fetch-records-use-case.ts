import { LeopardRepository } from "../../repositories/mssql/leopard-repository";
import { PumaRepositoryImpl } from "../../repositories/mssql/puma-repository-impl";

import { FetchRecordingsUseCase } from "../fetch-recordings";

export function makeFetchRecordingsUseCase() {
  const pumaRepositoryImpl = new PumaRepositoryImpl();
  const leopardRepository = new LeopardRepository();
  const fetchRecordingsUseCase = new FetchRecordingsUseCase(
    pumaRepositoryImpl,
    leopardRepository,
  );

  return fetchRecordingsUseCase;
}
