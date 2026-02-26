import { MssqlServilusaRepository } from "../../../repositories/mssql/mssql-servilusa-repository";
import { AltitudeAuthService } from "../../altitude/authenticate";
import { AltitudeCreateContact } from "../../altitude/create-contact";
import { Servilusa23081UseCase } from "../23081";

export function makeServilusa23081UseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const servilusaRepository = new MssqlServilusaRepository();
  const servilusaUseCase = new Servilusa23081UseCase(
    servilusaRepository,
    altitudeCreateContact,
  );

  return servilusaUseCase;
}
