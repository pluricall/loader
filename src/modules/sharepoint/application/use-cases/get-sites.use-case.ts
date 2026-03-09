import { ISharepointRepository } from "../../domain/repositories/sharepoint-repository";

export class GetSitesUseCase {
  constructor(private repo: ISharepointRepository) {}

  async execute() {
    return this.repo.getSites();
  }
}
