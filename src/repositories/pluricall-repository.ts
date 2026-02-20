import { IResult } from "mssql";
import {
  ClientRecordingsParams,
  FetchRecordingKeyParams,
  GetClientRecordings,
  LogPlenitudeCallCloud,
  RecordingDownloadInfo,
  RecordingFilters,
  RecordingKeyResult,
  RecordingMetadata,
} from "./types/pluricall-repository-types";

export interface PluricallRepository {
  findByName: (name: string) => Promise<{ name: string } | null>;
  findByCampaign: (
    campaign: string,
  ) => Promise<{ campaign: string; id: number } | null>;
  findByEmail: (campaign: string) => Promise<{ email: string } | null>;
  getAll: () => Promise<GetClientRecordings[]>;
  update: (name: string) => void;
  fetchRecordings(
    params: FetchRecordingKeyParams,
  ): Promise<RecordingKeyResult[]>;
  create: (data: ClientRecordingsParams) => void;
  saveSentRecordings(recording: RecordingMetadata): Promise<void>;
  searchRecordingsByFilters(
    filters: RecordingFilters,
  ): Promise<RecordingMetadata[]>;
  getInfoToDownloadRecordings: (
    easycode: string,
    clientId: string,
  ) => Promise<IResult<RecordingDownloadInfo>>;
  logPlenitudeCallCloud: (data: LogPlenitudeCallCloud) => void;
}
