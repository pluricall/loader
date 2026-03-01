import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryClientsRepository } from "../../repositories/in-memory/in-memory-clients-repository";
import { CreateBdUseCase } from "./create-bd";
import { InMemoryBdsRepository } from "../../repositories/in-memory/in-memory-bds-repository";
import { NotFoundError } from "../../shared/errors/not-found-error";

let clientsRepository: InMemoryClientsRepository;
let bdsRepository: InMemoryBdsRepository;
let sut: CreateBdUseCase;

describe("Create Bds Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    bdsRepository = new InMemoryBdsRepository();
    sut = new CreateBdUseCase(bdsRepository, clientsRepository);
  });

  it("should be able to create a bd inside a client", async () => {
    const client = await clientsRepository.create({
      client: "test",
      status: "ACTIVE",
      contact_dpo: "test@test.com",
      contact_ex_dto: null,
      info_ex_dto: "test",
      owner: "test",
      ftp_path: "/test/test",
      recording_devolution: "DAILY",
    });

    const { bd } = await sut.execute(client.id, {
      type: "EXTERNAL",
      status: "ACTIVE",
      user: "test",
      bdName: "test",
      origin: "test",
    });

    expect(bd.id).toEqual(expect.any(String));
  });

  it("should not be able to create bd with inexistent clientId", async () => {
    await expect(() =>
      sut.execute("non-existing-id", {
        type: "EXTERNAL",
        status: "ACTIVE",
        user: "test",
        bdName: "test",
        origin: "test",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
