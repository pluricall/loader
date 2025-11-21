import { Bds, Prisma } from "@prisma/client";

export interface BdsRepository {
  create: (
    clientId: string,
    data: Omit<Prisma.BdsUncheckedCreateInput, "client_id">,
  ) => Promise<Bds>;
  update: (bdId: string, data: Prisma.BdsUpdateInput) => Promise<Bds>;
  remove: (bdId: string) => Promise<Bds>;
  findById: (bdId: string) => Promise<Bds | null>;
  searchMany: (clientId: string) => Promise<Bds[]>;
}
