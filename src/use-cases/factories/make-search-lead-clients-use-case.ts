import { MssqlLeadsRepository } from "../../repositories/mssql/mssql-leads-repository";
import { SearchLeadClientsUseCase } from "../leads/search-lead-clients";

export function makeSearchLeadClientsUseCase() {
  const leadsRepositoryImpl = new MssqlLeadsRepository();
  const searchLeadClientsUseCase = new SearchLeadClientsUseCase(
    leadsRepositoryImpl,
  );

  return searchLeadClientsUseCase;
}
