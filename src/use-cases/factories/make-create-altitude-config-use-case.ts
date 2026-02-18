import { MssqlLeadsRepository } from "../../repositories/mssql/mssql-leads-repository";
import { CreateAltitudeConfigUseCase } from "../leads/create-altitude-config";

export function makeCreateAltitudeConfigUseCase() {
  const leadsRepositoryImpl = new MssqlLeadsRepository();
  const createAltitudeConfigUseCase = new CreateAltitudeConfigUseCase(
    leadsRepositoryImpl,
  );

  return createAltitudeConfigUseCase;
}
