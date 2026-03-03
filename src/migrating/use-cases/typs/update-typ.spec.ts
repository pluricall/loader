import { describe, it, beforeEach, expect } from "vitest";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { AlreadyExistsError } from "../../shared/errors/name-already-exists-error";
import { InMemoryTypsRepository } from "../../repositories/in-memory/in-memory-typs-repository";
import { UpdateTypUseCase } from "./update-typ";

let typsRepository: InMemoryTypsRepository;
let sut: UpdateTypUseCase;

describe("Update Typs Use Case", () => {
  beforeEach(() => {
    typsRepository = new InMemoryTypsRepository();
    sut = new UpdateTypUseCase(typsRepository);
  });

  it("should update an existing client", async () => {
    const createdTyp = await typsRepository.create({
      name: "test",
      separator: "|",
      entity_name: "ACTIVITY",
      loading_mode: "APPEND",
      fields: ["-test"],
      fixed_fields: {
        ACTIVITY_TIMEZONE: "GMT",
        ACTIVITY_STATUS: "Started",
        ACTIVITY_DIRECTORY: "test",
        ACTIVITY_CAMPAIGN: "test",
        ACTIVITY_ACT_LIST: "test",
        ACTIVITY_USES_DNCL: 1,
      },
    });

    const { typUpdated } = await sut.execute(createdTyp.id, {
      name: "updated-name",
      separator: ";",
      entityName: "ACTIVITY",
    });

    expect(typUpdated.name).toBe("updated-name");
    expect(typUpdated.separator).toBe(";");
    expect(typUpdated.entity_name).toBe("ACTIVITY");
    expect(typUpdated.updated_at).not.toBeNull();
  });

  it("should not be able to update if typ does not exist", async () => {
    await expect(
      sut.execute("non-existent-id", {
        name: "updated-name",
        separator: ";",
        entityName: "ACTIVITY",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not be able to changing name when already exists", async () => {
    const createdTyp = await typsRepository.create({
      name: "test",
      separator: "|",
      entity_name: "ACTIVITY",
      loading_mode: "APPEND",
      fields: ["-test"],
      fixed_fields: {
        ACTIVITY_TIMEZONE: "GMT",
        ACTIVITY_STATUS: "Started",
        ACTIVITY_DIRECTORY: "test",
        ACTIVITY_CAMPAIGN: "test",
        ACTIVITY_ACT_LIST: "test",
        ACTIVITY_USES_DNCL: 1,
      },
    });

    await typsRepository.create({
      name: "alreadyExistsName",
      separator: "|",
      entity_name: "ACTIVITY",
      loading_mode: "APPEND",
      fields: ["-test"],
      fixed_fields: {
        ACTIVITY_TIMEZONE: "GMT",
        ACTIVITY_STATUS: "Started",
        ACTIVITY_DIRECTORY: "test",
        ACTIVITY_CAMPAIGN: "test",
        ACTIVITY_ACT_LIST: "test",
        ACTIVITY_USES_DNCL: 1,
      },
    });

    await expect(
      sut.execute(createdTyp.id, {
        name: "alreadyExistsName",
      }),
    ).rejects.toBeInstanceOf(AlreadyExistsError);
  });
});
