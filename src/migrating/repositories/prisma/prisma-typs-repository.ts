import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { TypsRepository } from "../typs-repository";

export class PrismaTypsRepository implements TypsRepository {
  async create(data: Prisma.TypCreateInput) {
    return prisma.typ.create({ data });
  }

  async searchMany() {
    return prisma.typ.findMany({
      include: {
        sources: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.typ.findUnique({
      where: { id },
      include: {
        sources: {
          select: {
            id: true,
            name: true,
            origin: true,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.typ.findFirst({ where: { name } });
  }

  async update(id: string, data: Prisma.TypUpdateInput) {
    return prisma.typ.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    return prisma.typ.delete({ where: { id } });
  }
}
