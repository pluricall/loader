import { Prisma, Bds } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { BdsRepository } from "../bds-repository";

export class PrismaBdsRepository implements BdsRepository {
  async create(
    clientId: string,
    data: Omit<Prisma.BdsUncheckedCreateInput, "client_id">,
  ): Promise<Bds> {
    return prisma.bds.create({
      data: {
        ...data,
        client_id: clientId,
      },
    });
  }

  async searchMany(clientId: string) {
    return prisma.bds.findMany({
      where: {
        client_id: clientId,
      },
    });
  }

  findById(bdId: string) {
    return prisma.bds.findUnique({
      where: { id: bdId },
      include: {
        client: true,
        source: true,
      },
    });
  }

  async findByClientAndId(clientId: string, bdId: string): Promise<Bds | null> {
    return prisma.bds.findFirst({
      where: {
        id: bdId,
        client_id: clientId,
      },
    });
  }

  update(bdId: string, data: Prisma.BdsUpdateInput) {
    return prisma.bds.update({
      where: { id: bdId },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  remove(bdId: string) {
    return prisma.bds.delete({
      where: {
        id: bdId,
      },
    });
  }
}
