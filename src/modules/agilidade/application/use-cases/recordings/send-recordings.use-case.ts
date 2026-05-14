import { AgilidadeSendRecordingsService } from "../../../../../shared/infra/providers/agilidade/send-recordings";
import pLimit from "p-limit";
import {
  IAgilidadeRepository,
  RecordingRow,
} from "../../../domain/repositories/agilidade-repository";
import {
  LeopardRepository,
  RecordingData,
} from "../../../../../migrating/repositories/mssql/mssql-leopard-repository";
import { IFileService } from "../../../../../core/file/interfaces/file.types";
import { ILogger } from "../../../../../core/logger/interfaces/logger.types";

export class AgilidadeRecordingsUseCase {
  constructor(
    private agilidadeRepository: IAgilidadeRepository,
    private agilidadeApiService: AgilidadeSendRecordingsService,
    private leopardRepository: LeopardRepository,
    private fileService: IFileService,
    private logger: ILogger,
  ) {}

  private static readonly STORAGE_BASE_PATH =
    "\\\\tiger\\D$\\RepositorioAVR\\Storage";

  async execute(options: {
    initialDate: string;
    endDate: string;
    limit?: number;
  }) {
    let recordings = await this.getRecordings(options);

    if (options.limit) {
      recordings = recordings.slice(0, options.limit);
    }

    this.logger.info(
      { total: recordings.length, ...options },
      "Iniciando processamento de gravações",
    );

    const leopardMap = await this.getLeopardMap(recordings);

    const limit = pLimit(5);
    await Promise.all(
      recordings.map((r) => limit(() => this.processRecording(r, leopardMap))),
    );

    this.logger.info(
      { total: recordings.length, ...options },
      "Processamento concluído",
    );
  }

  private async getRecordings({
    initialDate,
    endDate,
  }: {
    initialDate: string;
    endDate: string;
  }): Promise<RecordingRow[]> {
    return this.agilidadeRepository.getRecordingsByDay({
      initialDate,
      endDate,
      includeHistorical: false,
    });
  }

  private async getLeopardMap(
    rows: RecordingRow[],
  ): Promise<Map<string, RecordingData>> {
    const recKeys = rows.map((r) => r.recording_key);
    const leopardFiles = await this.leopardRepository.findByRecKeys(recKeys);
    return new Map(leopardFiles.map((f) => [f.rec_key, f]));
  }

  private async processRecording(
    row: RecordingRow,
    leopardMap: Map<string, RecordingData>,
  ) {
    const leopard = leopardMap.get(row.recording_key);

    if (!leopard) {
      return this.logLeopardError(row);
    }

    const sourcePath = this.buildOriginPath(leopard);

    try {
      const buffer = await this.fileService.readFile(sourcePath);
      const date = new Date(row.call_start);
      const payload = this.mapToPayload(row, buffer, date);
      const fileName = this.buildFileName(row);

      const result = await this.agilidadeApiService.sendRecordings({
        ...payload,
        Gravacao: payload.Gravacao as Buffer,
        fileName,
      });

      await this.logSuccess(row, sourcePath, fileName, result.raw);
    } catch (err) {
      if (err instanceof Error) {
        await this.logError(row, sourcePath, err);
      }
    }
  }

  private async logSuccess(
    row: RecordingRow,
    origem: string,
    file_name: string,
    api_response: string,
  ) {
    this.logger.info(
      { recording_key: row.recording_key, file_name },
      "Gravação processada com sucesso",
    );

    await this.agilidadeRepository.saveSendRecordingLog({
      recording_key: row.recording_key,
      easycode: row.easycode,
      telefone: row.telefone ?? "",
      bd_id: row.bd_id,
      file_name,
      origem_path: origem,
      status: "SUCCESS",
      api_response,
    });
  }

  private async logError(
    row: RecordingRow,
    origem: string,
    err: Error & { response?: { status: number } },
  ) {
    const isApiError = !!err.response;

    this.logger.error(
      {
        recording_key: row.recording_key,
        error_type: isApiError ? "API" : "SYSTEM",
        http_status: err.response?.status,
        message: err.message,
      },
      "Falha ao processar gravação",
    );

    await this.agilidadeRepository.saveSendRecordingLog({
      recording_key: row.recording_key,
      easycode: row.easycode,
      telefone: row.telefone ?? "",
      bd_id: row.bd_id,
      file_name: "",
      origem_path: origem,
      status: "ERROR",
      error_type: isApiError ? "API" : "SYSTEM",
      api_response: err.message,
      http_status: err.response?.status,
    });
  }

  private async logLeopardError(row: RecordingRow) {
    this.logger.error(
      { recording_key: row.recording_key },
      "Sem dados Leopard para esta gravação",
    );

    await this.agilidadeRepository.saveSendRecordingLog({
      recording_key: row.recording_key,
      easycode: row.easycode,
      telefone: row.telefone ?? "",
      bd_id: row.bd_id,
      file_name: "",
      origem_path: "",
      status: "ERROR",
      error_type: "SYSTEM",
      api_response: "Leopard data not found",
    });
  }

  private mapStatus(resultado: string) {
    const map: Record<string, string> = {
      "1": "Convertida",
      "2": "Agendada",
      "3": "Sem Interesse",
      Y: "Não quer ser mais contactado em Telemarketing",
      Q: "Não pretende ser mais contactado",
      Z: "Cliente pede eliminação dos dados",
      C: "Não quer plano - quer ir a clínica",
      I: "Envio de informações",
      E: "Número errado",
      F: "Fax",
      V: "Voice Mail",
    };
    return map[resultado] ?? "Não Atendida";
  }

  private mapToPayload(row: RecordingRow, buffer: Buffer, date: Date) {
    return {
      Id: row.bd_id ?? "",
      TipoChamada: this.mapStatus(String(row.resultado)),
      DataHora: date.toISOString(),
      Telefone: row.telefone ?? "",
      AtendidaPor: (row.logincontacto ?? "").trim(),
      Duracao: this.formatDuration(Number(row.duracao)),
      Gravacao: buffer,
    };
  }

  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  private buildOriginPath(file: RecordingData): string {
    const ts = String(file.time_stamp).replace(/[-: ]/g, "");

    const year = ts.slice(0, 4);
    const month = ts.slice(4, 6);
    const day = ts.slice(6, 8);
    const hour = ts.slice(8, 10);
    const minute = ts.slice(10, 12);
    const second = ts.slice(12, 14);
    const ms = ts.slice(14, 17);

    const folder = `${year}\\${month}\\${day}\\${hour}\\${minute}\\`;
    const file_name = `${second}${ms}${file.rec_key}${file.rec_time}.wav`;

    return `${AgilidadeRecordingsUseCase.STORAGE_BASE_PATH}\\${folder}${file_name}`;
  }

  private buildFileName(row: RecordingRow): string {
    const telefone = row.telefone.replace(/[^a-zA-Z0-9]/g, "") ?? "semTelefone";
    const date = new Date(row.call_start);
    const formattedDate = date.toISOString().replace(/[:.]/g, "-");

    return `${formattedDate}_${telefone}_${row.easycode}_${row.bd_id}.wav`;
  }
}
