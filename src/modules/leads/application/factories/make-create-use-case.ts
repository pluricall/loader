import { MssqlLeadIntegrationRepository } from "../../infra/mssql/mssql-lead-integration-repository";
import { MssqlLeadMappingRepository } from "../../infra/mssql/mssql-lead-mapping-repository";
import { CreateLeadConfigUseCase } from "../use-cases/create";

export function makeCreateLeadConfigUseCase() {
  const mssqlLeadIntegrationRepository = new MssqlLeadIntegrationRepository();
  const mssqlLeadMappingRepository = new MssqlLeadMappingRepository();

  return new CreateLeadConfigUseCase(
    mssqlLeadIntegrationRepository,
    mssqlLeadMappingRepository,
  );
}
