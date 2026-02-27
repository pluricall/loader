import { AltitudeAuthService } from "../../../../use-cases/altitude/authenticate";
import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { Minisom21051UseCase } from "../21051/minisom-21051.use-case";
import { Minisom21051UploadContactsUseCase } from "../21051/upload-contacts.use-case";

export function Minisom21051Factory() {
  const altitudeAuthService = new AltitudeAuthService();
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
