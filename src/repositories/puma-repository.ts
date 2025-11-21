export interface FetchRecordingKeyParams {
  campaignName: string;
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
}

export interface ClientRecordingsParams {
  clientName: string;
  campaignName: string;
  percentDifferentsResult: number;
  startTime: string;
  siteId: string;
  driveId: string;
  folderPath?: string;
  status: "ACTIVO" | "INACTIVO";
  isBd: boolean;
  isHistorical: boolean;
  resultsNotInFivePercent: string | null;
}

export interface GetClientRecordings {
  clientName: string;
  campaignName: string;
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

export interface PumaRepository {
  findByName: (name: string) => Promise<{ name: string } | null>;
  findByCampaign: (campaign: string) => Promise<{ campaign: string } | null>;
  getAll: () => Promise<GetClientRecordings[]>;
  update: (name: string) => void;
  fetchRecordings(
    params: FetchRecordingKeyParams,
  ): Promise<RecordingKeyResult[]>;
  create: (data: ClientRecordingsParams) => void;
}
