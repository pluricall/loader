import { MssqlLeadsRepository } from "../../repositories/mssql/mssql-leads-repository";
import { CreateLeadClientUseCase } from "../leads/create-lead-client";

export function makeCreateLeadClientUseCase() {
  const leadsRepositoryImpl = new MssqlLeadsRepository();
  const createLeadClientUseCase = new CreateLeadClientUseCase(
    leadsRepositoryImpl,
  );

  return createLeadClientUseCase;
}
