import { AltitudeAuthServiceFactory } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { Minisom21051UseCase } from "../21051/minisom-21051.use-case";
import { Minisom21051UploadContactsUseCase } from "../21051/upload-contacts.use-case";

export function makeMinisom21051UseCase() {
  const altitudeAuthService = AltitudeAuthServiceFactory();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const minisomRepository = new MssqlMinisomRepository();
  const minisom21051UploadContacts = new Minisom21051UploadContactsUseCase(
    minisomRepository,
    altitudeCreateContact,
  );
  const minisom21051UseCase = new Minisom21051UseCase(
    minisomRepository,
    minisom21051UploadContacts,
  );

  return minisom21051UseCase;
}
