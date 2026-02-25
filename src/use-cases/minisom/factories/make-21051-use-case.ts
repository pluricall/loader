import { MssqlMinisomRepository } from "../../../repositories/mssql/mssql-minisom-repository";
import { AltitudeAuthService } from "../../altitude/authenticate";
import { AltitudeCreateContact } from "../../altitude/create-contact";
import { Minisom21051UseCase } from "../21051";

export function makeMinisom21051UseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const mssqlMinisomRepository = new MssqlMinisomRepository();
  const minisomRepository = new Minisom21051UseCase(
    mssqlMinisomRepository,
    altitudeCreateContact,
  );

  return minisomRepository;
}
