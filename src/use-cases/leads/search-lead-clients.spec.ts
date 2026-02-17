import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryLeadsRepository } from "../../repositories/in-memory/in-memory-leads-repository";
import { SearchLeadClientsUseCase } from "./search-lead-clients";
import { CreateLeadClientUseCase } from "./create-lead-client";
import { NotFoundError } from "../errors/not-found-error";

let repo: InMemoryLeadsRepository;
let sut: SearchLeadClientsUseCase;
let createClient: CreateLeadClientUseCase;

describe("Search Lead Clients Use Case", () => {
  beforeEach(() => {
    repo = new InMemoryLeadsRepository();
    sut = new SearchLeadClientsUseCase(repo);
    createClient = new CreateLeadClientUseCase(repo);
  });

  it("should return client, config and mapping", async () => {
    await createClient.execute({ clientName: "Test" });

    repo.configs.push({
      client_name: "Test",
      campaign_name: "CAMP",
      contact_list: "LIST",
      directory_name: "DIR",
      timezone: "UTC",
      default_status: "NEW",
      uses_dncl: false,
    });

    repo.mappings.push({
      client_name: "Test",
      source_field: "name",
      altitude_field: "ALT_NAME",
      is_required: true,
    });

    const result = await sut.execute("Test");

    expect(result.client).toBeDefined();
    expect(result.client.client_name).toBe("Test");

    expect(result.config).toBeDefined();
    expect(result.config?.campaign_name).toBe("CAMP");

    expect(result.mapping.length).toBe(1);
    expect(result.mapping[0].source_field).toBe("name");
  });

  it("should throw if client does not exist", async () => {
    await expect(() => sut.execute("Ghost")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("should return empty mapping if none exists", async () => {
    await createClient.execute({ clientName: "Test" });

    const result = await sut.execute("Test");

    expect(result.mapping).toEqual([]);
  });

  it("should return null config if none exists", async () => {
    await createClient.execute({ clientName: "Test" });

    const result = await sut.execute("Test");

    expect(result.config).toBeNull();
  });
});
