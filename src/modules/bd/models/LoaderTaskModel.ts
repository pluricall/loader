import { Prisma, PrismaClient } from '@prisma/client'

export class LoaderTaskModel {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.LoadersTaskCreateInput) {
    return this.prisma.loadersTask.create({
      data,
    })
  }
}
