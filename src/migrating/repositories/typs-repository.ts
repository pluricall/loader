import { Prisma, Typ } from "@prisma/client";

export interface TypsRepository {
  create: (data: Prisma.TypCreateInput) => Promise<Typ>;
  searchMany: () => Promise<Typ[]>;
  findById: (id: string) => Promise<Typ | null>;
  findByName: (name: string) => Promise<Typ | null>;
  update: (id: string, data: Prisma.TypUpdateInput) => Promise<Typ>;
  remove: (id: string) => Promise<Typ>;
}
