import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ClientsRepository } from "../clients-repository";

export class PrismaClientsRepository implements ClientsRepository {
  async create(data: Prisma.ClientsCreateInput) {
    return prisma.clients.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ClientsUpdateInput) {
    return prisma.clients.update({
      where: { id },
      data,
    });
  }

  async searchMany() {
    return prisma.clients.findMany();
  }

  async remove(id: string) {
    return prisma.clients.delete({
      where: {
        id,
      },
    });
  }

  async findByName(clientName: string) {
    return prisma.clients.findFirst({
      where: { client: clientName },
      include: {
        bds: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.clients.findUnique({
      where: { id },
      include: {
        bds: true,
      },
    });
  }
}
