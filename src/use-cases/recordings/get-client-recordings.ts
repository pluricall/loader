import { PumaRepositoryImpl } from "../../repositories/mssql/puma-repository-impl";
import { GetClientRecordings } from "../../repositories/puma-repository";

export interface GetClientRecordingsResponse {
  clientRecord: GetClientRecordings[];
}

export class GetClientRecordingsUseCase {
  constructor(
    private pumaRepository: PumaRepositoryImpl = new PumaRepositoryImpl(),
  ) {}

  async execute(): Promise<GetClientRecordingsResponse> {
    const clientRecord = await this.pumaRepository.getAll();

    return { clientRecord };
  }
}
