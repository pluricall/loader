import {
  ContractStatus,
  Marca,
  Periodicidade,
} from "../../application/use-cases/contracts/send-contracts.types";
import { AgilidadeLead } from "../entities/lead";

export interface SendRecordingsToClientApiRequest {
  initialDate: string;
  endDate: string;
  includeHistorical?: boolean;
}

export interface RecordingSendLog {
  recording_key: string;
  easycode: number;
  telefone: string;
  bd_id: string;

  file_name: string;
  origem_path: string;

  status: "SUCCESS" | "ERROR";
  error_type?: "SYSTEM" | "API";
  error_message?: string;

  http_status?: number;
}

export interface RecordingRow {
  easycode: number;
  telefone: string;
  logincontacto: string;
  duracao: number;
  bd_id: string;
  recording_key: string;
  moment: Date;
  call_start: Date;
  resultado: string;
  is_historical: number;
}

export interface ContractsLogData {
  lead_id: string;
  colaborador: string;
  marca: Marca;
  status: ContractStatus;
  telefone: string;
  email: string;
  data_assinatura: string;
  periodicidade: Periodicidade;
  valor_ativacao: number;
  mensalidade: number;
  num_beneficiarios: number;
  send_status: "SUCCESS" | "ERROR";
  error_type?: "API" | "SYSTEM";
  error_message?: string;
  http_status?: number;
  body?: string;
}

export interface IAgilidadeRepository {
  save(
    lead: AgilidadeLead,
    requestIp: string,
    requestUrl: string,
  ): Promise<void>;
  updateStatus: (gen_id: string, lead_status: string) => Promise<void>;
  getRecordingsByDay(
    data: SendRecordingsToClientApiRequest,
  ): Promise<RecordingRow[]>;
  saveSendRecordingLog: (data: RecordingSendLog) => Promise<void>;
  saveSendContractsLog(data: ContractsLogData): Promise<void>;
}
