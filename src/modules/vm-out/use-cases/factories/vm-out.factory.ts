import { ArtelecomReportService } from "../../../../shared/infra/providers/artelecom/artelecom-report.service";
import { MssqlVmOutRepository } from "../../infra/repositories/mssql/vm-out-mssql.repository";
import { VmOutUseCase } from "../vm-out.use-case";

export function makeVmOutUseCase(): VmOutUseCase {
  const repository = new MssqlVmOutRepository();
  const artelecomReportService = new ArtelecomReportService();

  return new VmOutUseCase(repository, artelecomReportService);
}
