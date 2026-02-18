import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryLeadsRepository } from "../../repositories/in-memory/in-memory-leads-repository";
import { SaveFieldMappingUseCase } from "./save-field-mapping";
import { CreateLeadClientUseCase } from "./create-lead-client";
import { NotFoundError } from "../errors/not-found-error";
import { ValidationError } from "../errors/validation-error";

let repo: InMemoryLeadsRepository;
let sut: SaveFieldMappingUseCase;
let createClient: CreateLeadClientUseCase;

describe("Save Field Mapping Use Case", () => {
  beforeEach(() => {
    repo = new InMemoryLeadsRepository();
    sut = new SaveFieldMappingUseCase(repo);
    createClient = new CreateLeadClientUseCase(repo);
  });

  it("should save field mapping successfully", async () => {
    await createClient.execute({ clientName: "Test", environment: "cloud" });

    const result = await sut.execute([
      {
        client_name: "Test",
        source_field: "name",
        altitude_field: "ALT_NAME",
        is_required: true,
      },
      {
        client_name: "Test",
        source_field: "phone",
        altitude_field: "ALT_PHONE",
        is_required: false,
      },
    ]);

    expect(result.success).toBe(true);
    expect(repo.mappings.length).toBe(2);
  });

  it("should not allow empty mapping array", async () => {
    await expect(() => sut.execute([])).rejects.toThrowError("Mapping empty");
  });

  it("should not allow mapping for non-existent client", async () => {
    await expect(() =>
      sut.execute([
        {
          client_name: "Ghost",
          source_field: "name",
          altitude_field: "ALT_NAME",
          is_required: true,
        },
      ]),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not allow duplicate source_field", async () => {
    await createClient.execute({ clientName: "Test", environment: "cloud" });

    await expect(() =>
      sut.execute([
        {
          client_name: "Test",
          source_field: "name",
          altitude_field: "ALT_NAME",
          is_required: true,
        },
        {
          client_name: "Test",
          source_field: "name",
          altitude_field: "ALT_NAME_2",
          is_required: false,
        },
      ]),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
