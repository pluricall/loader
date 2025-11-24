import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryTypsRepository } from "../../repositories/in-memory/in-memory-typs-repository";
import { SearchTypsUseCase } from "./search-typs";

let typsRepository: InMemoryTypsRepository;
let sut: SearchTypsUseCase;

describe("Search Typs Use Case", () => {
  beforeEach(() => {
    typsRepository = new InMemoryTypsRepository();
    sut = new SearchTypsUseCase(typsRepository);
  });

  it("should be able to search all registered typs", async () => {
    await typsRepository.create({
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
      name: "test-02",
      separator: "|",
      entity_name: "ACTIVITY",
      loading_mode: "APPEND",
      fields: ["-test-02"],
      fixed_fields: {
        ACTIVITY_TIMEZONE: "GMT",
        ACTIVITY_STATUS: "Started",
        ACTIVITY_DIRECTORY: "test-02",
        ACTIVITY_CAMPAIGN: "test-02",
        ACTIVITY_ACT_LIST: "test-02",
        ACTIVITY_USES_DNCL: 1,
      },
    });

    const { typs } = await sut.execute();

    expect(typs.length).toEqual(2);
  });
});
