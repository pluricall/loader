import { ISharepointRepository } from "../../domain/repositories/sharepoint-repository";

export class GetFoldersUseCase {
  constructor(private repo: ISharepointRepository) {}

  async execute(driveId: string, folderPath?: string) {
    if (!driveId) throw new Error("driveId is required");
    return this.repo.getFolders(driveId, folderPath);
  }
}
