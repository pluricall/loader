import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { Minisom21121UseCase } from "../21121/minisom-21121.use-case";
import { Minisom21121UploadContactsUseCase } from "../21121/queue";

export function makeMinisom21121UseCase() {
  const minisomRepository = new MssqlMinisomRepository();
  const minisom21121UploadContacts = new Minisom21121UploadContactsUseCase();
  const minisom21121UseCase = new Minisom21121UseCase(
    minisomRepository,
    minisom21121UploadContacts,
  );

  return minisom21121UseCase;
}
