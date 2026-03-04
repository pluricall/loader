import { MssqlServilusaRepository } from "../../repositories/mssql-servilusa.repository";
import { Servilusa23081UploadContactsUseCase } from "../queue";
import { Servilusa23081UseCase } from "../servilusa-23081.use-case";

export function makeServilusa23081UseCase() {
  const servilusaRepository = new MssqlServilusaRepository();
  const servilusa23081UploadContacts =
    new Servilusa23081UploadContactsUseCase();
  const servilusa23081UseCase = new Servilusa23081UseCase(
    servilusaRepository,
    servilusa23081UploadContacts,
  );

  return servilusa23081UseCase;
}
