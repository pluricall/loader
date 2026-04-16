import { LoggerService } from "../../../../../core/logger/logger.service";
import { AgilidadeSendContractsService } from "../../../../../shared/infra/providers/agilidade/send-contracts";
import { AgilidadeMssqlRepository } from "../../../infra/mssql/agilidade-mssql-repository";
import { AgilidadeContractsUseCase } from "../contracts/send-contracts.use-case";

export function makeSendContractsUseCase(): AgilidadeContractsUseCase {
  const repository = new AgilidadeMssqlRepository();
  const apiService = new AgilidadeSendContractsService();
  const loggerService = new LoggerService();

  return new AgilidadeContractsUseCase(repository, apiService, loggerService);
}
