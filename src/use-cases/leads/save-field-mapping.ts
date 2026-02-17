import { LeadsRepository } from "../../repositories/leads-repository";
import { FieldMappingDTO } from "../../repositories/types/leads-repository";
import { NotFoundError } from "../errors/not-found-error";
import { ValidationError } from "../errors/validation-error";

export class SaveFieldMappingUseCase {
  constructor(private leadsRepository: LeadsRepository) {}

  async execute(rows: FieldMappingDTO[]) {
    if (!rows.length) {
      throw new Error("Mapping empty");
    }

    const clientName = rows[0].client_name;

    const client = await this.leadsRepository.findClientByName(clientName);

    if (!client) {
      throw new NotFoundError("Client not found");
    }

    const dup = new Set<string>();

    for (const row of rows) {
      if (dup.has(row.source_field)) {
        throw new ValidationError(
          `Duplicate source_field: ${row.source_field}`,
        );
      }
      dup.add(row.source_field);
    }

    await this.leadsRepository.saveMapping(rows);

    return { success: true };
  }
}
