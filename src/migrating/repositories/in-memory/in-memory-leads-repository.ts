import { LeadsRepository } from "../leads-repository";
import {
  AltitudeConfig,
  ClientLead,
  CreateClientDTO,
  FieldMapping,
  FieldMappingDTO,
  LeadLogDTO,
} from "../types/leads-repository";

export class InMemoryLeadsRepository implements LeadsRepository {
  clients: ClientLead[] = [];
  configs: AltitudeConfig[] = [];
  mappings: FieldMappingDTO[] = [];
  logs: LeadLogDTO[] = [];

  async findClientByName(name: string): Promise<ClientLead | null> {
    return this.clients.find((c) => c.client_name === name) ?? null;
  }

  async getAltitudeConfig(clientName: string): Promise<AltitudeConfig | null> {
    return this.configs.find((c) => c.client_name === clientName) ?? null;
  }

  async getFieldMapping(clientName: string): Promise<FieldMapping[]> {
    return this.mappings.filter((m) => m.client_name === clientName);
  }

  async createClient(data: CreateClientDTO): Promise<void> {
    this.clients.push({
      client_name: data.client_name,
      api_key: data.api_key,
      is_active: data.is_active ?? true,
      environment: data.environment,
    });
  }

  async saveConfig(data: AltitudeConfig): Promise<void> {
    const existing = this.configs.find(
      (c) => c.client_name === data.client_name,
    );

    if (existing) {
      Object.assign(existing, data);
    } else {
      this.configs.push(data);
    }
  }

  async saveMapping(data: FieldMappingDTO[]): Promise<void> {
    for (const row of data) {
      const existing = this.mappings.find(
        (m) =>
          m.client_name === row.client_name &&
          m.source_field === row.source_field,
      );

      if (existing) {
        existing.altitude_field = row.altitude_field;
        existing.is_required = row.is_required;
      } else {
        this.mappings.push(row);
      }
    }
  }

  async saveLog(log: LeadLogDTO): Promise<void> {
    this.logs.push(log);
  }

  async findClientByApiKey(apiKey: string) {
    return (
      this.clients.find((c) => c.api_key === apiKey && c.is_active) ?? null
    );
  }
}
