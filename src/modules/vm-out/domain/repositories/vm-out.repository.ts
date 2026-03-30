export interface SaveVMOutData {
  executionId: string;
  genId: string;
  campanha: string;
  contactList: string;
  rawPhone: string;
  phone: string;
  calls: number;
  lastCall: string;
  status: string;
  reason?: string;
}

export interface IVmOutRepository {
  getBlacklist(): Promise<string[]>;
  getAttendedToday(): Promise<string[]>;
  save(data: SaveVMOutData): Promise<void>;
  updateStatus(
    genId: string,
    status: string,
    error?: string,
    response?: string,
  ): Promise<void>;
}
