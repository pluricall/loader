import { LeadsRepositoryImpl } from "../../repositories/mssql/leads-repository";
import { AltitudeAuthService } from "../altitude/authenticate";
import { AltitudeCreateContact } from "../altitude/create-contact";
import { AltitudeUploadContact } from "../altitude/upload-contact.ts";
import { LoadLeadsUseCase } from "../leads/load-leads";

export function makeLoadLeadsUseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const leadsRepository = new LeadsRepositoryImpl();
  const createContact = new AltitudeCreateContact(
    process.env.ALTITUDE_API_BASE!,
    altitudeAuthService,
  );
  const uploadContact = new AltitudeUploadContact(
    process.env.ALTITUDE_API_BASE!,
    altitudeAuthService,
  );
  return new LoadLeadsUseCase(leadsRepository, createContact, uploadContact);
}
