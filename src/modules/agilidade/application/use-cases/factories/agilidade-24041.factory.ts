import { AgilidadeMssqlRepository } from "../../../infra/mssql/agilidade-mssql-repository";
import { Agilidade24041UploadContactsUseCase } from "../24041/agilidade-24041-queue.use-case";
import { Agilidade24041UseCase } from "../24041/agilidade-24041.use-case";

export function makeAgilidade24041UseCase(): Agilidade24041UseCase {
  const repository = new AgilidadeMssqlRepository();
  const uploadContacts = new Agilidade24041UploadContactsUseCase();

  return new Agilidade24041UseCase(repository, uploadContacts);
}
