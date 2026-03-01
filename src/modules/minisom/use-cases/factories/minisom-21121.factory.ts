import { AltitudeAuthServiceFactory } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { Minisom21121UseCase } from "../21121/minisom-21121.use-case";
import { Minisom21121UploadContactsUseCase } from "../21121/upload-contacts.use-case";

export function makeMinisom21121UseCase() {
  const altitudeAuthService = AltitudeAuthServiceFactory();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const minisomRepository = new MssqlMinisomRepository();
  const minisom21121UploadContacts = new Minisom21121UploadContactsUseCase(
    minisomRepository,
    altitudeCreateContact,
  );
  const minisom21121UseCase = new Minisom21121UseCase(
    minisomRepository,
    minisom21121UploadContacts,
  );

  return minisom21121UseCase;
}
