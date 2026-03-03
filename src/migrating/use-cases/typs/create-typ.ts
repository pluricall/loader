import { TypsRepository } from "../../repositories/typs-repository";
import { AlreadyExistsError } from "../../shared/errors/name-already-exists-error";

interface RegisterTypsRequest {
  name: string;
  separator: string;
  fields: string[];
  fixedFields: Record<string, string | number>;
  loadingMode: "APPEND" | "UPDATE" | "APPEND_OR_UPDATE" | "REPLACE";
  entityName:
    | "ACTIVITY"
    | "CONTACT_PROFILE"
    | "CONSENT"
    | "DNCL_ENTRY"
    | "TABLE_SCHEMA_ENUM_VALUE"
    | "WF_PROCESS_INSTANCE";
}

export class CreateTypUseCase {
  constructor(private prismaTypsRepository: TypsRepository) {}

  async execute({
    name,
    entityName,
    fields,
    fixedFields,
    loadingMode,
    separator,
  }: RegisterTypsRequest) {
    const nameExists = await this.prismaTypsRepository.findByName(name);

    if (nameExists) {
      throw new AlreadyExistsError("Typ name already exists.");
    }

    const typ = await this.prismaTypsRepository.create({
      name,
      fields,
      separator,
      entity_name: entityName,
      fixed_fields: fixedFields,
      loading_mode: loadingMode,
    });

    return { typ };
  }
}
