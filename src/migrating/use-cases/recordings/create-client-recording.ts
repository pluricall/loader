import { MssqlPluricallRepository } from "../../repositories/mssql/mssql-pluricall-repository";
import { PluricallRepository } from "../../repositories/pluricall-repository";
import { ClientRecordingsParams } from "../../repositories/types/pluricall-repository-types";
import { AlreadyExistsError } from "../../shared/errors/name-already-exists-error";

export class CreateClientRecordingUseCase {
  constructor(
    private mssqlRepository: PluricallRepository = new MssqlPluricallRepository(),
  ) {}

  async execute(data: ClientRecordingsParams) {
    const nameExists = await this.mssqlRepository.findByName(data.clientName);
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

    const campaignExists = await this.mssqlRepository.findByCampaign(
      data.ctName,
    );

    if (campaignExists)
      throw new AlreadyExistsError("Campaign name already exists.");

    const emailExists = await this.mssqlRepository.findByEmail(data.email);

    if (emailExists) throw new AlreadyExistsError("Email already exists.");

    const created = await this.mssqlRepository.create({
      ...data,
      resultsNotInFivePercent: cleanResultsNotInFivePercent,
    });

    return created;
  }
}
