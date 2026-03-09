import { ISharepointRepository } from "../../domain/repositories/sharepoint-repository";

export class DownloadFileUseCase {
  constructor(private repo: ISharepointRepository) {}

  async execute(driveId: string, filePath: string) {
    if (!driveId) throw new Error("driveId is required");
    if (!filePath) throw new Error("filePath is required");
    return this.repo.downloadFile(driveId, filePath);
  }
}
