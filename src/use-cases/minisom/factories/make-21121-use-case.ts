import { MssqlMinisomRepository } from "../../../repositories/mssql/mssql-minisom-repository";
import { AltitudeAuthService } from "../../altitude/authenticate";
import { AltitudeCreateContact } from "../../altitude/create-contact";
import { Minisom21121UseCase } from "../21121";

export function makeMinisom21121UseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const mssqlMinisomRepository = new MssqlMinisomRepository();
  const minisomRepository = new Minisom21121UseCase(
    mssqlMinisomRepository,
    altitudeCreateContact,
  );

  return minisomRepository;
}
