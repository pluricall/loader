import { CampaignBodyRequest } from '../schemas/CampaignSchema'
import { AppError } from '../../../errors/AppError'
import { CampaignModel } from '../models/CampaignModel'

export class CampaignService {
  constructor(private campaignModel: CampaignModel) {}

  async create(data: CampaignBodyRequest) {
    try {
      const campaignNameAlreadyExists = await this.campaignModel.getByName(
        data.name,
      )

      if (campaignNameAlreadyExists) {
        throw AppError.conflict('Já existe uma campanha com esse nome.')
      }

      return await this.campaignModel.create(data)
    } catch (error) {
      console.error('[CampaignService][create] Erro ao criar campanha:', error)
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async getAll() {
    try {
      return await this.campaignModel.getAll()
    } catch (error) {
      console.error(
        '[CampaignService][getAll] Erro ao buscar campanhas:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async getById(id: string) {
    try {
      return await this.campaignModel.getById(id)
    } catch (error) {
      console.error(
        '[CampaignService][getById] Erro ao buscar campanha:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async update(id: string, data: CampaignBodyRequest) {
    try {
      const existingCampaign = await this.campaignModel.getById(id)

      if (!existingCampaign) {
        throw AppError.notFound('Campanha não encontrada.')
      }

      const campaignNameAlreadyExists = await this.campaignModel.getByName(
        data.name,
      )
      if (campaignNameAlreadyExists && campaignNameAlreadyExists.id !== id) {
        throw AppError.conflict('Já existe uma campanha com esse nome.')
      }

      return await this.campaignModel.update(id, data)
    } catch (error) {
      console.error(
        '[CampaignService][update] Erro ao atualizar campanha:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async delete(id: string) {
    try {
      const existing = await this.campaignModel.getById(id)
      if (!existing) {
        throw AppError.notFound('Campanha não encontrada.')
      }
      return await this.campaignModel.delete(id)
    } catch (error) {
      console.error(
        '[CampaignService][delete] Erro ao deletar campanha:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }
}
