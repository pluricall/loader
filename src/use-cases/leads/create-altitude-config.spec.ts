import { expect, describe, it, beforeEach } from "vitest";
import { InMemoryLeadsRepository } from "../../repositories/in-memory/in-memory-leads-repository";
import { CreateAltitudeConfigUseCase } from "./create-altitude-config";
import { NotFoundError } from "../errors/not-found-error";
import { CreateLeadClientUseCase } from "./create-lead-client";

let leadsRepository: InMemoryLeadsRepository;
let sut: CreateAltitudeConfigUseCase;
let sutHelper: CreateLeadClientUseCase;

describe("Create Altitude Config Use Case", () => {
  beforeEach(() => {
    leadsRepository = new InMemoryLeadsRepository();
    sut = new CreateAltitudeConfigUseCase(leadsRepository);
    sutHelper = new CreateLeadClientUseCase(leadsRepository);
  });

  it("should to create an altitude config", async () => {
    await sutHelper.execute({
      clientName: "Test",
      environment: "cloud",
    });

    const { success } = await sut.execute({
      client_name: "Test",
      campaign_name: "Test",
      contact_list: "CL_TEST",
      directory_name: "TEST",
      timezone: "GMT",
      uses_dncl: true,
      default_status: "true",
    });

    expect(success).toEqual(expect.any(Boolean));
  });

  it("should not be able to get an inexistent client", async () => {
    await expect(() =>
      sut.execute({
        client_name: "Test",
        campaign_name: "Test",
        contact_list: "CL_TEST",
        directory_name: "TEST",
        timezone: "GMT",
        uses_dncl: true,
        default_status: "true",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
