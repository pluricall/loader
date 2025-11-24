import { expect, describe, it, beforeEach } from "vitest";
import { CreateClientUseCase } from "./create-client";
import { InMemoryClientsRepository } from "../../repositories/in-memory/in-memory-clients-repository";
import { AlreadyExistsError } from "../errors/name-already-exists-error";

let clientsRepository: InMemoryClientsRepository;
let sut: CreateClientUseCase;

describe("Create Clients Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    sut = new CreateClientUseCase(clientsRepository);
  });

  it("should to create a client", async () => {
    const { clients } = await sut.execute({
      clientName: "Cliente",
      status: "ACTIVE",
      contactDpo: "test@test.com",
      contactExDto: null,
      infoExDto: "test",
      owner: "test",
      ftpPath: "/test/test",
      recordingDevolution: "DAILY",
    });

    expect(clients.id).toEqual(expect.any(String));
  });

  it("should not be able to create a client with same name twice", async () => {
    const NAME = "test";
    await sut.execute({
      clientName: NAME,
      status: "ACTIVE",
      contactDpo: "test@test.com",
      contactExDto: null,
      infoExDto: "test",
      owner: "test",
      ftpPath: "/test/test",
      recordingDevolution: "DAILY",
    });

    await expect(() =>
      sut.execute({
        clientName: NAME,
        status: "ACTIVE",
        contactDpo: "test@test.com",
        contactExDto: null,
        infoExDto: "test",
        owner: "test",
        ftpPath: "/test/test",
        recordingDevolution: "DAILY",
      }),
    ).rejects.toBeInstanceOf(AlreadyExistsError);
  });
});
