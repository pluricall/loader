import { expect, describe, it, beforeEach } from "vitest";
import { AlreadyExistsError } from "../errors/name-already-exists-error";
import { CreateLeadClientUseCase } from "./create-lead-client";
import { InMemoryLeadsRepository } from "../../repositories/in-memory/in-memory-leads-repository";

let leadsRepository: InMemoryLeadsRepository;
let sut: CreateLeadClientUseCase;

describe("Create Lead Client Use Case", () => {
  beforeEach(() => {
    leadsRepository = new InMemoryLeadsRepository();
    sut = new CreateLeadClientUseCase(leadsRepository);
  });

  it("should to create a client", async () => {
    const { api_key, client_name } = await sut.execute({
      clientName: "Teste",
    });

    expect(api_key).toEqual(expect.any(String));
    expect(client_name).toEqual(expect.any(String));
  });

  it("should not be able to create a client with same name twice", async () => {
    const NAME = "test";
    await sut.execute({
      clientName: NAME,
    });

    await expect(() =>
      sut.execute({
        clientName: NAME,
      }),
    ).rejects.toBeInstanceOf(AlreadyExistsError);
  });
});
