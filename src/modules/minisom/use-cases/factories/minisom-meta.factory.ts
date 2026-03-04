import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { MinisomMetaUseCase } from "../meta/minisom-meta.use-case";
import { MinisomMetaUploadContactsUseCase } from "../meta/queue";

export function makeMinisomMetaUseCase() {
  const minisomRepository = new MssqlMinisomRepository();
  const minisomMetaUploadContacts = new MinisomMetaUploadContactsUseCase();
  const minisomMetaUseCase = new MinisomMetaUseCase(
    minisomRepository,
    minisomMetaUploadContacts,
  );

  return minisomMetaUseCase;
}
