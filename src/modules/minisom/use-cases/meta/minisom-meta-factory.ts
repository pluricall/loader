import { AltitudeAuthService } from "../../../../use-cases/altitude/authenticate";
import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { MinisomMetaUseCase } from "./minisom-meta.use-case";
import { MinisomMetaUploadContactsUseCase } from "./upload-contacts.use-case";

export function MinisomMetaFactory() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const minisomRepository = new MssqlMinisomRepository();
  const minisomMetaUploadContacts = new MinisomMetaUploadContactsUseCase(
    minisomRepository,
    altitudeCreateContact,
  );
  const minisomMetaUseCase = new MinisomMetaUseCase(
    minisomRepository,
    minisomMetaUploadContacts,
  );

  return minisomMetaUseCase;
}
