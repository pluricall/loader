import { ReportsRepository } from "../repositories/relatorios.repository";

export class FindAllReportsUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute() {
    const reports = await this.reportsRepository.findAll();

    return reports;
  }
}
