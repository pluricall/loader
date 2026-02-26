import { downloadFromSharepoint } from "../../http/controllers/sharepoint/download";
import { MssqlRepository } from "../../repositories/mssql/mssql-pluricall-repository";
import { PluricallRepository } from "../../repositories/pluricall-repository";

export interface DownloadedRecording {
  buffer: Buffer;
  fileName: string;
  mime: string;
}

export class DownloadSharepointRecordingUseCase {
  constructor(
    private mssqlRepository: PluricallRepository = new MssqlRepository(),
  ) {}

  async execute(
    clientId: string,
    easycode: string,
  ): Promise<DownloadedRecording[]> {
    if (!easycode) throw new Error("easycode é obrigatório");
    if (!clientId) throw new Error("clientId é obrigatório");

    const result = await this.mssqlRepository.getInfoToDownloadRecordings(
      easycode,
      clientId,
    );

    if (!result || !result.recordset?.length) {
      throw new Error("Gravação não encontrada.");
    }

    const downloads: DownloadedRecording[] = [];

    for (const recording of result.recordset) {
      const { drive_id, sharepoint_location, file_name } = recording;

      if (!drive_id || !sharepoint_location) {
        console.warn(`Ignorando gravação sem info SharePoint: ${file_name}`);
        continue;
      }

      const buffer = await downloadFromSharepoint(
        drive_id,
        sharepoint_location,
      );

      downloads.push({
        buffer,
        fileName: file_name,
        mime: "audio/wav",
      });
    }

    if (!downloads.length) {
      throw new Error("Nenhuma gravação válida encontrada para download");
    }

    return downloads;
  }
}
