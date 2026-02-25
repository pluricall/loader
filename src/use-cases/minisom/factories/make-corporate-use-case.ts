import { MssqlMinisomRepository } from "../../../repositories/mssql/mssql-minisom-repository";
import { AltitudeAuthService } from "../../altitude/authenticate";
import { AltitudeCreateContact } from "../../altitude/create-contact";
import { MinisomCorporateUseCaseOfc } from "../corporate";

export function makeMinisomCorporateUseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const mssqlMinisomRepository = new MssqlMinisomRepository();
  const minisomRepository = new MinisomCorporateUseCaseOfc(
    mssqlMinisomRepository,
    altitudeCreateContact,
  );

  return minisomRepository;
}
