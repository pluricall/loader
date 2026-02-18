import { MssqlLeadsRepository } from "../../repositories/mssql/mssql-leads-repository";
import { SaveFieldMappingUseCase } from "../leads/save-field-mapping";

export function makeSaveFieldMappingUseCase() {
  const leadsRepositoryImpl = new MssqlLeadsRepository();
  const saveFieldMappingUseCase = new SaveFieldMappingUseCase(
    leadsRepositoryImpl,
  );

  return saveFieldMappingUseCase;
}
