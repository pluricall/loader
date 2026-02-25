import { MssqlMinisomRepository } from "../../../repositories/mssql/mssql-minisom-repository";
import { AltitudeAuthService } from "../../altitude/authenticate";
import { AltitudeCreateContact } from "../../altitude/create-contact";
import { MinisomCorporateUseCase } from "../corporate";

export function makeMinisomCorporateUseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const mssqlMinisomRepository = new MssqlMinisomRepository();
  const minisomRepository = new MinisomCorporateUseCase(
    mssqlMinisomRepository,
    altitudeCreateContact,
  );

  return minisomRepository;
}
