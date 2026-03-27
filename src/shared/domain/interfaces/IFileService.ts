export interface IFileService {
  exists(path: string): Promise<boolean>;
  parseCSV(path: string): Promise<any[]>;
  createFolder(path: string): Promise<void>;
  moveFile(from: string, to: string): Promise<void>;
}
