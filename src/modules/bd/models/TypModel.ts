import { PrismaClient } from '@prisma/client'
import { TypBodyRequest } from '../schemas/TypSchema'

export class TypModel {
  constructor(private prisma: PrismaClient) {}

  async create(data: TypBodyRequest) {
    return this.prisma.typBD.create({ data })
  }

  async getAll() {
    return this.prisma.typBD.findMany({
      select: {
        id: true,
        name: true,
        sources: {
          select: {
            id: true,
            name: true,
            origin: true,
          },
        },
      },
    })
  }

  async getById(id: string) {
    return this.prisma.typBD.findUnique({
      where: { id },
      include: {
        sources: {
          select: {
            id: true,
            name: true,
            origin: true,
            campaign: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  }

  async getByName(name: string) {
    return this.prisma.typBD.findFirst({ where: { name } })
  }

  async update(id: string, data: TypBodyRequest) {
    return this.prisma.typBD.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    })
  }

  async delete(id: string) {
    return this.prisma.typBD.delete({ where: { id } })
  }
}
