import { Bds, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { BdsRepository } from "../bds-repository";

export class InMemoryBdsRepository implements BdsRepository {
  public items: Bds[] = [];

  async create(
    clientId: string,
    data: Omit<Prisma.BdsUncheckedCreateInput, "client_id">,
  ): Promise<Bds> {
    const bd: Bds = {
      id: randomUUID(),
      client_id: clientId,
      client_id_from_plc: data.client_id_from_plc ?? null,
      type: data.type,
      user: data.user ?? null,
      status: data.status,
      bd_name: data.bd_name,
      code: data.code,
      origin: data.origin,
      created_at: new Date(),
      updated_at: null,
    };

    this.items.push(bd);
    return bd;
  }

  async searchMany(clientId: string): Promise<Bds[]> {
    return this.items.filter((bd) => bd.client_id === clientId);
  }

  async findById(bdId: string): Promise<Bds | null> {
    return this.items.find((bd) => bd.id === bdId) ?? null;
  }

  async findByClientAndId(clientId: string, bdId: string): Promise<Bds | null> {
    return (
      this.items.find((bd) => bd.id === bdId && bd.client_id === clientId) ??
      null
    );
  }

  async update(bdId: string, data: Prisma.BdsUpdateInput): Promise<Bds> {
    const index = this.items.findIndex((bd) => bd.id === bdId);
    if (index === -1) {
      throw new Error("BD not found");
    }

    const existing = this.items[index];

    const updated: Bds = {
      ...existing,
      ...data,
      updated_at: new Date(),
    } as Bds;

    this.items[index] = updated;
    return updated;
  }

  async remove(bdId: string): Promise<Bds> {
    const index = this.items.findIndex((bd) => bd.id === bdId);
    if (index === -1) {
      throw new Error("BD not found");
    }
    const [removed] = this.items.splice(index, 1);
    return removed;
  }
}
