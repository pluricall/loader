import { LeopardRepository } from "../repositories/mssql/leopard-repository";
import {
  PumaRepository,
  FetchRecordingKeyParams,
} from "../repositories/puma-repository";

export class FetchRecordingsUseCase {
  constructor(
    private readonly pumaRepository: PumaRepository,
    private readonly leopardRepository: LeopardRepository,
  ) {}

  async execute({
    campaignName,
    day,
    percentDifferentsResult,
    resultsNotInFivePercent,
    isHistorical,
  }: FetchRecordingKeyParams) {
    const recordingKeys = await this.pumaRepository.fetchRecordings({
      campaignName,
      day,
      percentDifferentsResult,
      resultsNotInFivePercent,
      isHistorical,
    });

    if (recordingKeys.length === 0) {
      return [];
    }

    const keys = recordingKeys.map((r) => r.recording_key);
    const leopardRecords =
      await this.leopardRepository.fetchRecordingFiles(keys);

    const pumaMap = new Map(recordingKeys.map((r) => [r.recording_key, r]));

    return leopardRecords.map((leopard) => {
      const pumaRecord = pumaMap.get(leopard.rec_key);

      return {
        total: recordingKeys.length,
        rec_key: leopard.rec_key,
        time_stamp: leopard.time_stamp,
        rec_time: leopard.rec_time,
        file_size: leopard.file_size,
        easycode: pumaRecord?.easycode,
        telefone: pumaRecord?.telefone,
        moment: pumaRecord?.moment,
        bd: pumaRecord?.bd,
        campaign: pumaRecord?.campaign,
        resultado: pumaRecord?.resultado,
      };
    });
  }
}
