import { Clients, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { ClientsRepository } from "../clients-repository";

export class InMemoryClientsRepository implements ClientsRepository {
  public items: Clients[] = [];

  async create(data: Prisma.ClientsUncheckedCreateInput): Promise<Clients> {
    const client: Clients = {
      id: randomUUID(),
      client: data.client,
      status: data.status,
      contact_dpo: data.contact_dpo ?? null,
      contact_ex_dto: data.contact_ex_dto ?? null,
      info_ex_dto: data.info_ex_dto ?? null,
      owner: data.owner,
      ftp_path: data.ftp_path,
      recording_devolution: data.recording_devolution ?? null,
      created_at: new Date(),
      updated_at: null,
    };

    this.items.push(client);
    return client;
  }

  async update(id: string, data: Prisma.ClientsUpdateInput): Promise<Clients> {
    const index = this.items.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Client not found");
    }

    const updated = {
      ...this.items[index],
      ...data,
    } as Clients;

    this.items[index] = updated;
    return updated;
  }

  async searchMany(): Promise<Clients[]> {
    return this.items;
  }

  async remove(id: string): Promise<Clients> {
    const index = this.items.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Client not found");
    }
    const [removed] = this.items.splice(index, 1);
    return removed;
  }

  async findByName(clientName: string): Promise<Clients | null> {
    return this.items.find((c) => c.client === clientName) ?? null;
  }

  async findById(id: string): Promise<Clients | null> {
    return this.items.find((c) => c.id === id) ?? null;
  }
}
