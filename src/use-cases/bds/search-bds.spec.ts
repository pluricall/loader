import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryClientsRepository } from "../../repositories/in-memory/in-memory-clients-repository";
import { InMemoryBdsRepository } from "../../repositories/in-memory/in-memory-bds-repository";
import { SearchBdsUseCase } from "./search-bds";
import { NotFoundError } from "../../shared/errors/not-found-error";

let clientsRepository: InMemoryClientsRepository;
let bdsRepository: InMemoryBdsRepository;
let sut: SearchBdsUseCase;

describe("Search Bds Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    bdsRepository = new InMemoryBdsRepository();
    sut = new SearchBdsUseCase(bdsRepository, clientsRepository);
  });

  it("should be able to fetch all registered bds in a unique client", async () => {
    const createdClient = await clientsRepository.create({
      id: "client-01",
      client: "test",
      status: "ACTIVE",
      contact_dpo: "test@test.com",
      contact_ex_dto: null,
      info_ex_dto: "test",
      owner: "test",
      ftp_path: "/test/test",
      recording_devolution: "DAILY",
    });

    await bdsRepository.create(createdClient.id, {
      code: "TEST01",
      type: "EXTERNAL",
      status: "ACTIVE",
      user: "test",
      bd_name: "test",
      origin: "test",
    });

    const { bds } = await sut.execute({ clientId: createdClient.id });

    expect(bds.length).toEqual(1);
  });

  it("should not be able to search bds with a inexistent clientId", async () => {
    await expect(() =>
      sut.execute({ clientId: "non-existing-id" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
