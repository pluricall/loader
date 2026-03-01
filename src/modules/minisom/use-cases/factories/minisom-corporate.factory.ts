import { AltitudeAuthServiceFactory } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { MinisomCorporateUseCase } from "../corporate/minisom-corporate.use-case";
import { MinisomCorporateUploadContactsUseCase } from "../corporate/upload-contacts.use-case";

export function makeMinisomCorporateUseCase() {
  const altitudeAuthService = AltitudeAuthServiceFactory();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const minisomRepository = new MssqlMinisomRepository();
  const minisomCorporateUploadContacts =
    new MinisomCorporateUploadContactsUseCase(
      minisomRepository,
      altitudeCreateContact,
    );
  const minisomCorporateUseCase = new MinisomCorporateUseCase(
    minisomRepository,
    minisomCorporateUploadContacts,
  );

  return minisomCorporateUseCase;
}
