import { LeadLogsDTO } from "../dtos/create-lead-logs.dto";

export interface LeadLogsRepository {
  save(log: LeadLogsDTO): Promise<void>;
}
