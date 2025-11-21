import { Clients, Prisma } from "@prisma/client";

export interface ClientsRepository {
  create: (data: Prisma.ClientsCreateInput) => Promise<Clients>;
  update: (id: string, data: Prisma.ClientsUpdateInput) => Promise<Clients>;
  searchMany: () => Promise<Clients[]>;
  remove: (id: string) => Promise<Clients>;
  findByName: (clientName: string) => Promise<Clients | null>;
  findById: (id: string) => Promise<Clients | null>;
}
