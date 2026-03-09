import { ISharepointRepository } from "../../domain/repositories/sharepoint-repository";

export class GetDrivesUseCase {
  constructor(private repo: ISharepointRepository) {}

  async execute(siteId: string) {
    if (!siteId) throw new Error("siteId is required");
    return this.repo.getDrives(siteId);
  }
}
