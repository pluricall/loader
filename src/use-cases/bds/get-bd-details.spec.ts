import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryClientsRepository } from "../../repositories/in-memory/in-memory-clients-repository";
import { GetBdDetailsUseCase } from "./get-bd-details";
import { InMemoryBdsRepository } from "../../repositories/in-memory/in-memory-bds-repository";
import { NotFoundError } from "../errors/not-found-error";

let clientsRepository: InMemoryClientsRepository;
let bdsRepository: InMemoryBdsRepository;
let sut: GetBdDetailsUseCase;

describe("Get Bd Details Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    bdsRepository = new InMemoryBdsRepository();
    sut = new GetBdDetailsUseCase(bdsRepository, clientsRepository);
  });

  it("should be able to get bd details", async () => {
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

    const { bd } = await sut.execute({
      clientId: createdClient.id,
      bdId: createdBd.id,
    });

    expect(bd.id).toEqual(expect.any(String));
    expect(bd.bd_name).toEqual("test");
  });

  it("should not be able to get bd details if client does not exist", async () => {
    await expect(
      sut.execute({ clientId: "wrong", bdId: "any" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not be able to get bd details if bd does not exist for client", async () => {
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

    await expect(
      sut.execute({ clientId: client.id, bdId: "wrong" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
