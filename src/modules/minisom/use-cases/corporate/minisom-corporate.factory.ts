import { AltitudeAuthService } from "../../../../use-cases/altitude/authenticate";
import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { MssqlMinisomRepository } from "../../repositories/mssql-minisom.repository";
import { MinisomCorporateUseCase } from "./minisom-corporate.use-case";
import { MinisomCorporateUploadContactsUseCase } from "./upload-contacts.use-case";

export function MinisomCorporateFactory() {
  const altitudeAuthService = new AltitudeAuthService();
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
