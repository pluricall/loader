import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { Minisom21051UseCase } from "../21051/minisom-21051.use-case";
import { Minisom21051UploadContactsUseCase } from "../21051/queue";

export function makeMinisom21051UseCase() {
  const minisomRepository = new MssqlMinisomRepository();
  const minisom21051UploadContacts = new Minisom21051UploadContactsUseCase();
  const minisom21051UseCase = new Minisom21051UseCase(
    minisomRepository,
    minisom21051UploadContacts,
  );

  return minisom21051UseCase;
}
