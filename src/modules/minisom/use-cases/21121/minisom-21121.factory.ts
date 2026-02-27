import { AltitudeAuthService } from "../../../../use-cases/altitude/authenticate";
import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { Minisom21121UseCase } from "./minisom-21121.use-case";
import { Minisom21121UploadContactsUseCase } from "./upload-contacts.use-case";

export function Minisom21121Factory() {
  const altitudeAuthService = new AltitudeAuthService();
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
