import { MssqlLeadsRepository } from "../../repositories/mssql/mssql-leads-repository";
import { AltitudeAuthService } from "../altitude/authenticate";
import { AltitudeCreateContact } from "../altitude/create-contact";
import { AltitudeUploadContact } from "../altitude/upload-contact.ts";
import { LoadLeadsUseCase } from "../leads/load-leads";

export function makeLoadLeadsUseCase() {
  const altitudeAuthService = new AltitudeAuthService();
  const leadsRepository = new MssqlLeadsRepository();
  const createContact = new AltitudeCreateContact(altitudeAuthService);
  const uploadContact = new AltitudeUploadContact(altitudeAuthService);
  return new LoadLeadsUseCase(leadsRepository, createContact, uploadContact);
}
