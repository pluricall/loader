import { IResult } from "mssql";

export interface FetchRecordingKeyParams {
  ctName: string;
  day: string;
  percentDifferentsResult: number;
  isHistorical: boolean;
  resultsNotInFivePercent: string | null;
}

export interface RecordingKeyResult {
  recording_key: string;
  easycode: number;
  moment: string;
  telefone: string;
  bd: string;
  campaign: string;
  resultado: string;
  loginContacto: string;
  duration: number;
}

export interface ClientRecordingsParams {
  clientName: string;
  ctName: string;
  percentDifferentsResult: number;
  startTime: string;
  siteId: string;
  driveId: string;
  folderPath?: string;
  status: "ACTIVO" | "INACTIVO";
  isBd: boolean;
  isHistorical: boolean;
  resultsNotInFivePercent: string | null;
  password?: string;
  email: string;
}

export interface GetClientRecordings {
  clientName: string;
  ct_: string;
  percentDifferentsResult: number;
  startTime: string;
  status: "ACTIVO" | "INACTIVO";
  folderPath: string;
  driveId: string;
  isBd: boolean;
  isHistorical: boolean;
  resultsNotInFivePercent: string | null;
  siteId: string;
}

export interface RecordingMetadata {
  clientId: number;
  clientName: string;
  easycode: number;
  campaign: string;
  moment: string;
  language: string;
  sharepointLocation: string;
  loginContacto: string;
  resultado: string;
  duration: number;

  status: "SUCCESS" | "ERROR";
  errorMessage?: string | null;
  origem: string;
  fileName: string;
}

export interface RecordingFilters {
  clientId: string;
  easycode?: string;
  language?: string;
  startDate?: string;
  endDate?: string;
}

export interface RecordingDownloadInfo {
  easycode: string;
  client_name: string;
  language: string;
  moment: string;
  duration: number;
  file_name: string;
  sharepoint_location: string;
  site_id: string;
  drive_id: string;
  folder_path: string;
  clientNameLogin: string;
}

export interface PumaRepository {
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
}
