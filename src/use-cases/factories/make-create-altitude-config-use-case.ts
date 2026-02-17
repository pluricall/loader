import { LeadsRepositoryImpl } from "../../repositories/mssql/leads-repository";
import { CreateAltitudeConfigUseCase } from "../leads/create-altitude-config";

export function makeCreateAltitudeConfigUseCase() {
  const leadsRepositoryImpl = new LeadsRepositoryImpl();
  const createAltitudeConfigUseCase = new CreateAltitudeConfigUseCase(
    leadsRepositoryImpl,
  );

  return createAltitudeConfigUseCase;
}
