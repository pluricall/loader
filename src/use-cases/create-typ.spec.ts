import { expect, describe, it, beforeEach } from "vitest";
import { AlreadyExistsError } from "./errors/name-already-exists-error";
import { CreateTypUseCase } from "./create-typ";
import { InMemoryTypsRepository } from "../repositories/in-memory/in-memory-typs-repository";

let typsRepository: InMemoryTypsRepository;
let sut: CreateTypUseCase;

describe("Create Typ Use Case", () => {
  beforeEach(() => {
    typsRepository = new InMemoryTypsRepository();
    sut = new CreateTypUseCase(typsRepository);
  });

  it("should to create a typ", async () => {
    const { typ } = await sut.execute({
      name: "test",
      separator: "|",
      entityName: "ACTIVITY",
      loadingMode: "APPEND",
      fields: ["-test"],
      fixedFields: {
        ACTIVITY_TIMEZONE: "GMT",
        ACTIVITY_STATUS: "Started",
        ACTIVITY_DIRECTORY: "test",
        ACTIVITY_CAMPAIGN: "test",
        ACTIVITY_ACT_LIST: "test",
        ACTIVITY_USES_DNCL: 1,
      },
    });

    expect(typ.id).toEqual(expect.any(String));
  });

  it("should not be able to create a client with same name twice", async () => {
    const NAME = "test";
    await sut.execute({
      name: NAME,
      separator: "|",
      entityName: "ACTIVITY",
      loadingMode: "APPEND",
      fields: ["-test"],
      fixedFields: {
        ACTIVITY_TIMEZONE: "GMT",
        ACTIVITY_STATUS: "Started",
        ACTIVITY_DIRECTORY: "test",
        ACTIVITY_CAMPAIGN: "test",
        ACTIVITY_ACT_LIST: "test",
        ACTIVITY_USES_DNCL: 1,
      },
    });

    await expect(() =>
      sut.execute({
        name: NAME,
        separator: "|",
        entityName: "ACTIVITY",
        loadingMode: "APPEND",
        fields: ["-test"],
        fixedFields: {
          ACTIVITY_TIMEZONE: "GMT",
          ACTIVITY_STATUS: "Started",
          ACTIVITY_DIRECTORY: "test",
          ACTIVITY_CAMPAIGN: "test",
          ACTIVITY_ACT_LIST: "test",
          ACTIVITY_USES_DNCL: 1,
        },
      }),
    ).rejects.toBeInstanceOf(AlreadyExistsError);
  });
});
