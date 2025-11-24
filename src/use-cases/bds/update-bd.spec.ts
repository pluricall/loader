import { describe, it, beforeEach, expect } from "vitest";
import { InMemoryClientsRepository } from "../../repositories/in-memory/in-memory-clients-repository";
import { NotFoundError } from "../errors/not-found-error";
import { UpdateBdUseCase } from "./update-bd";
import { InMemoryBdsRepository } from "../../repositories/in-memory/in-memory-bds-repository";

let clientsRepository: InMemoryClientsRepository;
let bdsRepository: InMemoryBdsRepository;
let sut: UpdateBdUseCase;

describe("Update Bds Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    bdsRepository = new InMemoryBdsRepository();
    sut = new UpdateBdUseCase(bdsRepository, clientsRepository);
  });

  it("should update an existing bd client", async () => {
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

    const createdBd = await bdsRepository.create(createdClient.id, {
      code: "TEST01",
      type: "EXTERNAL",
      status: "ACTIVE",
      user: "test",
      bd_name: "test",
      origin: "test",
    });

    const { bd: updatedBd } = await sut.execute({
      clientId: createdClient.id,
      bdId: createdBd.id,
      data: { bdName: "updated-name", user: "updated-user" },
    });

    expect(updatedBd.bd_name).toBe("updated-name");
    expect(updatedBd.user).toBe("updated-user");
    expect(updatedBd.status).toBe("ACTIVE");
    expect(updatedBd.updated_at).not.toBeNull();
  });

  it("should not be able to update if client does not exist", async () => {
    await expect(
      sut.execute({
        clientId: "non-existing-id",
        bdId: "non-existing-id",
        data: { bdName: "updated-name", user: "updated-user" },
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
