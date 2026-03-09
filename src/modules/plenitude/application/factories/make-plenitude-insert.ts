import { MssqlPluricallRepository } from "../../../../migrating/repositories/mssql/mssql-pluricall-repository";
import { PlenitudeAuthService } from "../use-cases/authenticate";
import { PlenitudeInsert } from "../use-cases/insert";

export function makePlenitudeInsert(environment?: "prod" | "test") {
  const mssqlRepository = new MssqlPluricallRepository();
  const plenitudeAuthService = new PlenitudeAuthService(environment);
  const plenitudeInsert = new PlenitudeInsert(
    plenitudeAuthService,
    mssqlRepository,
  );

  return plenitudeInsert;
}
