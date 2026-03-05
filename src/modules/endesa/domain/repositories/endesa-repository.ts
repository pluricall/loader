import { EndesaLead } from "../entities/lead";

export interface IEndesaRepository {
  save(lead: EndesaLead, requestIp: string, requestUrl: string): Promise<void>;
  updateStatus: (gen_id: string, lead_status: string) => Promise<void>;
}
