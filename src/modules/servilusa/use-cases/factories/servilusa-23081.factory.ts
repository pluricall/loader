import { AltitudeAuthServiceFactory } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { MssqlServilusaRepository } from "../../repositories/mssql-servilusa.repository";
import { Servilusa23081UseCase } from "../servilusa-23081.use-case";
import { Servilusa23081UploadContactsUseCase } from "../upload-contact.use-case";

export function makeServilusa23081UseCase() {
  const altitudeAuthService = AltitudeAuthServiceFactory();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const servilusaRepository = new MssqlServilusaRepository();
  const servilusa23081UploadContacts = new Servilusa23081UploadContactsUseCase(
    servilusaRepository,
    altitudeCreateContact,
  );
  const servilusa23081UseCase = new Servilusa23081UseCase(
    servilusaRepository,
    servilusa23081UploadContacts,
  );

  return servilusa23081UseCase;
}
