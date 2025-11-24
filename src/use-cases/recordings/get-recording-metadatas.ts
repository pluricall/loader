import { PumaRepositoryImpl } from "../../repositories/mssql/puma-repository-impl";
import { RecordingMetadata } from "../../repositories/puma-repository";
import { ValidationError } from "../errors/validation-error";

export interface GetRecordingsRequest {
  clientId: string;
  easycode?: string;
  language?: string;
  startDate?: string;
  endDate?: string;
}

export class GetRecordingMetadatasUseCase {
  constructor(
    private pumaRepositoryImpl: PumaRepositoryImpl = new PumaRepositoryImpl(),
  ) {}

  async execute(filters: GetRecordingsRequest): Promise<RecordingMetadata[]> {
    this.validateFilters(filters);
    return this.pumaRepositoryImpl.searchRecordingsByFilters(filters);
  }

  private validateFilters(filters: GetRecordingsRequest) {
    const { startDate, endDate, language } = filters;

    if (language) {
      const allowed = ["es", "en", "pt"];
      if (!allowed.includes(language)) {
        throw new ValidationError(
          `Language inválida. Use: ${allowed.join(", ")}`,
        );
      }
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (startDate && !dateRegex.test(startDate)) {
      throw new ValidationError("startDate deve estar no formato YYYY-MM-DD");
    }

    if (endDate && !dateRegex.test(endDate)) {
      throw new ValidationError("endDate deve estar no formato YYYY-MM-DD");
    }

    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new ValidationError("startDate não pode ser maior que endDate");
    }
  }
}
