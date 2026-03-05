import { AgilidadeLead } from "../entities/lead";

export interface IAgilidadeRepository {
  save(
    lead: AgilidadeLead,
    requestIp: string,
    requestUrl: string,
  ): Promise<void>;
  updateStatus: (gen_id: string, lead_status: string) => Promise<void>;
}
