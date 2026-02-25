import { MssqlAgilidadeRepository } from "../../../repositories/mssql/mssql-agilidade-repository";
import { AltitudeAuthService } from "../../altitude/authenticate";
import { AltitudeCreateContact } from "../../altitude/create-contact";
import { Agilidade24041UseCase } from "../24041";

export function makeAgilidade24041UseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const mssqlAgilidadeRepository = new MssqlAgilidadeRepository();
  const agilidade24041UseCase = new Agilidade24041UseCase(
    mssqlAgilidadeRepository,
    altitudeCreateContact,
  );

  return agilidade24041UseCase;
}
