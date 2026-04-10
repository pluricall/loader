import { FileService } from "../../../../shared/infra/services/file.service";
import { MssqlVmOutRepository } from "../../infra/repositories/mssql/vm-out-mssql.repository";
import { VmOutUseCase } from "../vm-out.use-case";

export function makeVmOutUseCase(): VmOutUseCase {
  const repository = new MssqlVmOutRepository();
  const fileService = new FileService();

  return new VmOutUseCase(fileService, repository);
}
