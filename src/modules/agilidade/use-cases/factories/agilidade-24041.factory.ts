import { AltitudeAuthServiceFactory } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { MssqlAgilidadeRepository } from "../../repositories/mssql-agilidade.repository";
import { Agilidade24041UseCase } from "../24041/agilidade-24041.use-case";
import { Agilidade24041UploadContactsUseCase } from "../24041/upload-contacts.use-case";

export function makeAgilidade24041UseCase() {
  const altitudeAuthService = AltitudeAuthServiceFactory();
  const agilidadeRepository = new MssqlAgilidadeRepository();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const agilidade24041UploadContacts = new Agilidade24041UploadContactsUseCase(
    agilidadeRepository,
    altitudeCreateContact,
  );
  const agilidade24041UseCase = new Agilidade24041UseCase(
    agilidadeRepository,
    agilidade24041UploadContacts,
  );

  return agilidade24041UseCase;
}
