import { LeadsRepositoryImpl } from "../../repositories/mssql/leads-repository";
import { SearchLeadClientsUseCase } from "../leads/search-lead-clients";

export function makeSearchLeadClientsUseCase() {
  const leadsRepositoryImpl = new LeadsRepositoryImpl();
  const searchLeadClientsUseCase = new SearchLeadClientsUseCase(
    leadsRepositoryImpl,
  );

  return searchLeadClientsUseCase;
}
