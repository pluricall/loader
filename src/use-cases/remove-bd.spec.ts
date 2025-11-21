import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryClientsRepository } from "../repositories/in-memory/in-memory-clients-repository";
import { NotFoundError } from "./errors/not-found-error";
import { InMemoryBdsRepository } from "../repositories/in-memory/in-memory-bds-repository";
import { RemoveBdUseCase } from "./remove-bd";

let clientsRepository: InMemoryClientsRepository;
let bdsRepository: InMemoryBdsRepository;
let sut: RemoveBdUseCase;

describe("Delete Bds Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    bdsRepository = new InMemoryBdsRepository();
    sut = new RemoveBdUseCase(bdsRepository, clientsRepository);
  });

  it("should be able to delete a bd inside a client", async () => {
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

    const createdBd = await bdsRepository.create(createdClient.id, {
      code: "TEST01",
      type: "EXTERNAL",
      status: "ACTIVE",
      user: "test",
      bd_name: "test",
      origin: "test",
    });

    const { bd } = await sut.execute({
      clientId: createdClient.id,
      bdId: createdBd.id,
    });

    expect(bd.id).toBe(createdBd.id);

    const found = await bdsRepository.findById(createdBd.id);
    expect(found).toBeNull();
  });

  it("should not be able to delete a bd with wrong-id", async () => {
    await expect(() =>
      sut.execute({ clientId: "non-existing-id", bdId: "non-existing-id" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
