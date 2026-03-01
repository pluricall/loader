import { AltitudeAuthServiceFactory } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { MinisomMetaUseCase } from "../meta/minisom-meta.use-case";
import { MinisomMetaUploadContactsUseCase } from "../meta/upload-contacts.use-case";

export function makeMinisomMetaUseCase() {
  const altitudeAuthService = AltitudeAuthServiceFactory();
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
