import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryClientsRepository } from "../../repositories/in-memory/in-memory-clients-repository";
import { GetClientDetailsUseCase } from "./get-client-details";
import { NotFoundError } from "../errors/not-found-error";

let clientsRepository: InMemoryClientsRepository;
let sut: GetClientDetailsUseCase;

describe("Get Client Details Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    sut = new GetClientDetailsUseCase(clientsRepository);
  });

  it("should be able to get client details", async () => {
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

    expect(client.id).toEqual(expect.any(String));
    expect(client.client).toEqual("test");
  });

  it("should not be able to get client details with wrong clientId", async () => {
    await expect(() =>
      sut.execute({ clientId: "wrong-id" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
