import { expect, describe, it, beforeEach } from "vitest";
import { NotFoundError } from "../errors/not-found-error";
import { InMemoryTypsRepository } from "../../repositories/in-memory/in-memory-typs-repository";
import { GetTypDetailsUseCase } from "./get-typ-details";

let typsRepository: InMemoryTypsRepository;
let sut: GetTypDetailsUseCase;

describe("Get Typ Details Use Case", () => {
  beforeEach(() => {
    typsRepository = new InMemoryTypsRepository();
    sut = new GetTypDetailsUseCase(typsRepository);
  });

  it("should be able to get typ details", async () => {
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

    const { typ } = await sut.execute(createdTyp.id);

    expect(typ.id).toEqual(expect.any(String));
    expect(typ.name).toEqual("test");
  });

  it("should not be able to get typ details with wrong typId", async () => {
    await expect(() => sut.execute("wrong-id")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
