import { describe, it, beforeEach, expect } from "vitest";
import { InMemoryClientsRepository } from "../repositories/in-memory/in-memory-clients-repository";
import { UpdateClientsUseCase } from "./update-client";
import { NotFoundError } from "./errors/not-found-error";
import { AlreadyExistsError } from "./errors/name-already-exists-error";

let clientsRepository: InMemoryClientsRepository;
let sut: UpdateClientsUseCase;

describe("Update Clients Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    sut = new UpdateClientsUseCase(clientsRepository);
  });

  it("should update an existing client", async () => {
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

    const { clients } = await sut.execute(createdClient.id, {
      clientName: "changed-name",
      contactDpo: "changed@changed.com",
    });

    expect(clients.client).toBe("changed-name");
    expect(clients.contact_dpo).toBe("changed@changed.com");
    expect(clients.status).toBe("ACTIVE");
    expect(clients.updated_at).not.toBeNull();
  });

  it("should not be able to update if client does not exist", async () => {
    await expect(
      sut.execute("non-existing-id", {
        clientName: "test",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not be able to changing name when already exists", async () => {
    await clientsRepository.create({
      client: "test",
      status: "ACTIVE",
      contact_dpo: "test@test.com",
      contact_ex_dto: null,
      info_ex_dto: "test",
      owner: "test",
      ftp_path: "/test/test",
      recording_devolution: "DAILY",
    });

    const clientToUpdate = await clientsRepository.create({
      client: "test-02",
      status: "ACTIVE",
      contact_dpo: "test-02@test-02.com",
      contact_ex_dto: null,
      info_ex_dto: "test-02",
      owner: "test-02",
      ftp_path: "/test-02/test-02",
      recording_devolution: "DAILY",
    });

    await expect(
      sut.execute(clientToUpdate.id, {
        clientName: "test",
      }),
    ).rejects.toBeInstanceOf(AlreadyExistsError);
  });
});
