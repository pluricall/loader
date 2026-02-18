import { MssqlRepository } from "../../repositories/mssql/mssql-pluricall-repository";
import { PluricallRepository } from "../../repositories/pluricall-repository";
import { GetClientRecordings } from "../../repositories/types/pluricall-repository-types";

export interface GetClientRecordingsResponse {
  clientRecord: GetClientRecordings[];
}

export class GetClientRecordingsUseCase {
  constructor(
    private pumaRepository: PluricallRepository = new MssqlRepository(),
  ) {}

  async execute(): Promise<GetClientRecordingsResponse> {
    const clientRecord = await this.pumaRepository.getAll();

    return { clientRecord };
  }
}
