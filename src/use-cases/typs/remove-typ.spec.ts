import { expect, describe, it, beforeEach } from "vitest";
import { NotFoundError } from "../errors/not-found-error";
import { RemoveTypUseCase } from "./remove-typ";
import { InMemoryTypsRepository } from "../../repositories/in-memory/in-memory-typs-repository";

let typsRepository: InMemoryTypsRepository;
let sut: RemoveTypUseCase;

describe("Delete Client Use Case", () => {
  beforeEach(() => {
    typsRepository = new InMemoryTypsRepository();
    sut = new RemoveTypUseCase(typsRepository);
  });

  it("should be able to delete a typ", async () => {
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

    const typ = await sut.execute({ typId: createdTyp.id });

    expect(typ.id).toBe(createdTyp.id);

    const found = await typsRepository.findById(createdTyp.id);
    expect(found).toBeNull();
  });

  it("should not be able to delete a typ", async () => {
    await expect(() =>
      sut.execute({ typId: "non-existent-id" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
