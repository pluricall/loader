import { MssqlAgilidadeRepository } from "../../repositories/mssql-agilidade.repository";
import { Agilidade24041UseCase } from "../24041/agilidade-24041.use-case";
import { Agilidade24041UploadContactsUseCase } from "../24041/upload-contacts.use-case";

export function makeAgilidade24041UseCase() {
  const agilidadeRepository = new MssqlAgilidadeRepository();
  const agilidade24041UploadContacts =
    new Agilidade24041UploadContactsUseCase();
  const agilidade24041UseCase = new Agilidade24041UseCase(
    agilidadeRepository,
    agilidade24041UploadContacts,
  );

  return agilidade24041UseCase;
}
