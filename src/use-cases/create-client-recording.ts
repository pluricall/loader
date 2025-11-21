import { PumaRepositoryImpl } from "../repositories/mssql/puma-repository-impl";
import { ClientRecordingsParams } from "../repositories/puma-repository";
import { AlreadyExistsError } from "./errors/name-already-exists-error";

export class CreateClientRecordingUseCase {
  constructor(
    private pumaRepository: PumaRepositoryImpl = new PumaRepositoryImpl(),
  ) {}

  async execute(data: ClientRecordingsParams) {
    const nameExists = await this.pumaRepository.findByName(data.clientName);
    if (nameExists) throw new AlreadyExistsError("Client name already exists.");
    const cleanResultsNotInFivePercent =
      data.resultsNotInFivePercent && data.resultsNotInFivePercent.trim()
        ? data.resultsNotInFivePercent
            .replace(/['"]/g, "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
            .join(",")
        : "";

    const campaignExists = await this.pumaRepository.findByCampaign(
      data.campaignName,
    );

    if (campaignExists)
      throw new AlreadyExistsError("Campaign name already exists.");

    const created = await this.pumaRepository.createClientRecordings({
      ...data,
      resultsNotInFivePercent: cleanResultsNotInFivePercent,
    });

    return created;
  }
}
