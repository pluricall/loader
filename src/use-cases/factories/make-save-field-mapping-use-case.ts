import { LeadsRepositoryImpl } from "../../repositories/mssql/leads-repository";
import { SaveFieldMappingUseCase } from "../leads/save-field-mapping";

export function makeSaveFieldMappingUseCase() {
  const leadsRepositoryImpl = new LeadsRepositoryImpl();
  const saveFieldMappingUseCase = new SaveFieldMappingUseCase(
    leadsRepositoryImpl,
  );

  return saveFieldMappingUseCase;
}
