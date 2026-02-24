import { MssqlMinisomRepository } from "../../../repositories/mssql/mssql-minisom-repository";
import { AltitudeAuthService } from "../../altitude/authenticate";
import { AltitudeCreateContact } from "../../altitude/create-contact";
import { MinisomMetaUseCase } from "../meta";

export function makeMinisomMetaUseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const mssqlMinisomRepository = new MssqlMinisomRepository();
  const minisomRepository = new MinisomMetaUseCase(
    mssqlMinisomRepository,
    altitudeCreateContact,
  );

  return minisomRepository;
}
