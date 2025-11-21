import { EntityNameEnum, LoadingModeEnum } from "@prisma/client";
import { TypsRepository } from "../repositories/typs-repository";
import { NotFoundError } from "./errors/not-found-error";
import { AlreadyExistsError } from "./errors/name-already-exists-error";

interface UpdateTypRequest {
  name?: string;
  separator?: string;
  fields?: string[];
  fixedFields?: Record<string, string | number>;
  loadingMode?: LoadingModeEnum;
  entityName?: EntityNameEnum;
}

export class UpdateTypUseCase {
  constructor(private prismaTypsRepository: TypsRepository) {}

  async execute(typId: string, data: UpdateTypRequest) {
    const existingTyp = await this.prismaTypsRepository.findById(typId);

    if (!existingTyp) {
      throw new NotFoundError("Typ not found.");
    }

    if (data.name && data.name !== existingTyp.name) {
      const nameAlreadyExists = await this.prismaTypsRepository.findByName(
        data.name as string,
      );

      if (nameAlreadyExists && nameAlreadyExists.id !== typId) {
        throw new AlreadyExistsError("Typ name already exists.");
      }
    }

    const typUpdated = await this.prismaTypsRepository.update(typId, {
      name: data.name ?? existingTyp.name,
      separator: data.separator ?? existingTyp.separator,
      fields: data.fields ?? existingTyp.fields,
      fixed_fields:
        data.fixedFields !== undefined ? data.fixedFields : undefined,
      loading_mode: data.loadingMode ?? existingTyp.loading_mode,
      entity_name: data.entityName ?? existingTyp.entity_name,
    });

    return { typUpdated };
  }
}
