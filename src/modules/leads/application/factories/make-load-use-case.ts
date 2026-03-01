import { AltitudeAuthServiceFactory } from "../../../../shared/infra/providers/altitude/auth.service";
import { AltitudeCreateContact } from "../../../../shared/infra/providers/altitude/create-contact.service";
import { AltitudeUploadContact } from "../../../../shared/infra/providers/altitude/upload-contact.service";
import { MssqlLeadLogsRepository } from "../../infra/mssql/mssql-lead-logs-repository";
import { MssqlLeadMappingRepository } from "../../infra/mssql/mssql-lead-mapping-repository";
import { LoadLeadsUseCase } from "../use-cases/load";

export function makeLoadLeadUseCase() {
  const altitudeAuthService = AltitudeAuthServiceFactory();
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
