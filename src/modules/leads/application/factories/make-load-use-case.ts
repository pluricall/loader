import { AltitudeAuthService } from "../../../../use-cases/altitude/authenticate";
import { AltitudeCreateContact } from "../../../../use-cases/altitude/create-contact";
import { AltitudeUploadContact } from "../../../../use-cases/altitude/upload-contact.ts";
import { MssqlLeadLogsRepository } from "../../infra/mssql/mssql-lead-logs-repository";
import { MssqlLeadMappingRepository } from "../../infra/mssql/mssql-lead-mapping-repository";
import { LoadLeadsUseCase } from "../use-cases/load";

export function makeLoadLeadUseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const leadLogsRepository = new MssqlLeadLogsRepository();
  const leadMappingRepository = new MssqlLeadMappingRepository();
  const createContact = new AltitudeCreateContact(altitudeAuthService);
  const uploadContact = new AltitudeUploadContact(altitudeAuthService);

  return new LoadLeadsUseCase(
    leadLogsRepository,
    leadMappingRepository,
    createContact,
    uploadContact,
  );
}
