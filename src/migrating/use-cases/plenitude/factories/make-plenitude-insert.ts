import { MssqlPluricallRepository } from "../../../repositories/mssql/mssql-pluricall-repository";
import { PlenitudeAuthService } from "../authenticate";
import { PlenitudeInsert } from "../insert";

export function makePlenitudeInsert(environment?: "prod" | "test") {
  const mssqlRepository = new MssqlPluricallRepository();
  const plenitudeAuthService = new PlenitudeAuthService(environment);
  const plenitudeInsert = new PlenitudeInsert(
    plenitudeAuthService,
    mssqlRepository,
  );

  return plenitudeInsert;
}
