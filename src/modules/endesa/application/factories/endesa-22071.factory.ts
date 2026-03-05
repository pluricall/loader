import { EndesaMssqlRepository } from "../../infra/mssql/endesa-mssql-repository";
import { Endesa22071UploadContactsUseCase } from "../use-cases/endesa-22071-queue.use-case";
import { Endesa22071UseCase } from "../use-cases/endesa-22071.use-case";

export function makeEndesa22071UseCase(): Endesa22071UseCase {
  const repository = new EndesaMssqlRepository();
  const uploadContacts = new Endesa22071UploadContactsUseCase();

  return new Endesa22071UseCase(repository, uploadContacts);
}
