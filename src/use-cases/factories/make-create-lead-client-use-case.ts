import { LeadsRepositoryImpl } from "../../repositories/mssql/leads-repository";
import { CreateLeadClientUseCase } from "../leads/create-lead-client";

export function makeCreateLeadClientUseCase() {
  const leadsRepositoryImpl = new LeadsRepositoryImpl();
  const createLeadClientUseCase = new CreateLeadClientUseCase(
    leadsRepositoryImpl,
  );

  return createLeadClientUseCase;
}
