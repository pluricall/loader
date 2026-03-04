import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { MinisomCorporateUseCase } from "../corporate/minisom-corporate.use-case";
import { MinisomCorporateUploadContactsUseCase } from "../corporate/queue";

export function makeMinisomCorporateUseCase() {
  const minisomRepository = new MssqlMinisomRepository();
  const minisomCorporateUploadContacts =
    new MinisomCorporateUploadContactsUseCase();
  const minisomCorporateUseCase = new MinisomCorporateUseCase(
    minisomRepository,
    minisomCorporateUploadContacts,
  );

  return minisomCorporateUseCase;
}
