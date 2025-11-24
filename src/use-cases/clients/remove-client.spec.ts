import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryClientsRepository } from "../../repositories/in-memory/in-memory-clients-repository";
import { NotFoundError } from "../errors/not-found-error";
import { RemoveClientUseCase } from "./remove-client";

let clientsRepository: InMemoryClientsRepository;
let sut: RemoveClientUseCase;

describe("Delete Client Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    sut = new RemoveClientUseCase(clientsRepository);
  });

  it("should be able to delete a client", async () => {
    const createdClient = await clientsRepository.create({
      client: "test",
      status: "ACTIVE",
      contact_dpo: "test@test.com",
      contact_ex_dto: null,
      info_ex_dto: "test",
      owner: "test",
      ftp_path: "/test/test",
      recording_devolution: "DAILY",
    });

    const { client } = await sut.execute({ clientId: createdClient.id });

    expect(client.id).toBe(createdClient.id);

    const found = await clientsRepository.findById(createdClient.id);
    expect(found).toBeNull();
  });

  it("should not be able to delete a client", async () => {
    await expect(() =>
      sut.execute({ clientId: "wrong-id" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
