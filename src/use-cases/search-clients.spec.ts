import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryClientsRepository } from "../repositories/in-memory/in-memory-clients-repository";
import { SearchClientsUseCase } from "./search-clients";

let clientsRepository: InMemoryClientsRepository;
let sut: SearchClientsUseCase;

describe("Search Clients Use Case", () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository();
    sut = new SearchClientsUseCase(clientsRepository);
  });

  it("should be able to search all registered clients", async () => {
    await clientsRepository.create({
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

    await clientsRepository.create({
      id: "client-02",
      client: "test-02",
      status: "ACTIVE",
      contact_dpo: "test@test.com",
      contact_ex_dto: null,
      info_ex_dto: "test-02",
      owner: "test-02",
      ftp_path: "/test-02/test-02",
      recording_devolution: "DAILY",
    });

    const { clients } = await sut.execute();

    expect(clients.length).toEqual(2);
  });
});
