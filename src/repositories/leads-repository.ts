import {
  AltitudeConfig,
  ClientLead,
  CreateClientDTO,
  FieldMapping,
  FieldMappingDTO,
  LeadLogDTO,
} from "./types/leads-repository";

export interface LeadsRepository {
  findClientByName(name: string): Promise<ClientLead | null>;
  getAltitudeConfig(clientName: string): Promise<AltitudeConfig | null>;
  getFieldMapping(clientName: string): Promise<FieldMapping[]>;
  createClient(data: CreateClientDTO): Promise<void>;
  saveMapping(data: FieldMappingDTO[]): Promise<void>;
  saveConfig(data: AltitudeConfig): Promise<void>;
  saveLog(log: LeadLogDTO): Promise<void>;
  findClientByApiKey(apiKey: string): Promise<ClientLead | null>;
}
