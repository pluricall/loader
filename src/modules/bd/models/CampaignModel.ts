import { Prisma, PrismaClient } from '@prisma/client'
import { CampaignBodyRequest } from '../schemas/CampaignSchema'
import { AppError } from '../../../errors/AppError'
import { CustomError } from '../../../errors/error'

export class CampaignModel {
  constructor(private prisma: PrismaClient) {}

  private campaignData(data: Prisma.CampaignCreateInput) {
    const expirationDate = new Date(data.expiration)

    if (isNaN(expirationDate.getTime())) {
      throw new CustomError('Data de expiração inválida.', 400)
    }

    return {
      name: data.name,
      expiration: expirationDate,
      campaign_type: data.campaign_type,
      description: data.description || '',
      updated_by: 'rgsm',
      updated_at: new Date(),
    }
  }

  async create(data: Prisma.CampaignCreateInput) {
    return this.prisma.campaign.create({
      data: {
        ...this.campaignData(data),
        created_by: 'rgsm',
      },
    })
  }

  async getAll() {
    return this.prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        campaign_type: true,
        sources: {
          select: {
            id: true,
            name: true,
            full_url: true,
          },
        },
      },
    })
  }

  async getById(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        sources: {
          include: {
            typ: true,
          },
        },
      },
    })
  }

  async getByName(name: string) {
    return this.prisma.campaign.findUnique({
      where: { name },
    })
  }

  async update(id: string, data: CampaignBodyRequest) {
    const existingCampaign = await this.prisma.campaign.findUnique({
      where: { id },
    })

    if (!existingCampaign) {
      throw new CustomError('Campanha não encontrada.', 404)
    }

    const updatedData = {} as Prisma.CampaignUpdateInput

    if (existingCampaign.name !== data.name) {
      updatedData.name = data.name
    }
    const expirationDate = new Date(data.expiration)
    if (existingCampaign.expiration.getTime() !== expirationDate.getTime()) {
      updatedData.expiration = expirationDate
    }
    if (existingCampaign.campaign_type !== data.campaign_type) {
      updatedData.campaign_type = data.campaign_type
    }
    if (existingCampaign.description !== data.description) {
      updatedData.description = data.description || ''
    }

    if (Object.keys(updatedData).length === 0) {
      throw AppError.badRequest('Não há alterações para atualizar.')
    }

    updatedData.updated_by = 'rgsm'
    updatedData.updated_at = new Date()

    return this.prisma.campaign.update({
      where: { id },
      data: updatedData,
    })
  }

  async delete(id: string) {
    return this.prisma.campaign.delete({
      where: { id },
    })
  }
}
