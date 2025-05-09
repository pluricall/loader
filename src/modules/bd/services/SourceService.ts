import {
  SourceBodyRequest,
  SourceBodyUpdateRequest,
} from '../schemas/SourceSchema'
import { AppError } from '../../../errors/AppError'
import { SourceModel } from '../models/SourceModel'
import { CampaignModel } from '../models/CampaignModel'
import { TypModel } from '../models/TypModel'

export class SourceService {
  constructor(
    private campaignModel: CampaignModel,
    private sourceModel: SourceModel,
    private typModel: TypModel,
  ) {}

  async create(data: SourceBodyRequest) {
    try {
      const campaign = await this.campaignModel.getById(data.campaignId)
      if (!campaign) throw AppError.notFound('Campanha não encontrada')

      if (data.typId) {
        const typ = await this.typModel.getById(data.typId)
        if (!typ) throw AppError.notFound('Typ não encontrado.')
      }

      const sourceNameAlreadyExists = await this.sourceModel.getByName(
        data.name,
        data.campaignId,
      )

      if (sourceNameAlreadyExists) {
        throw AppError.conflict(
          'Já existe um source com esse nome para essa campanha.',
        )
      }

      const createdSource = await this.sourceModel.create(data)
      return createdSource
    } catch (error) {
      console.error('[SourceService][create] Erro ao criar campanha:', error)
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async getById(id: string) {
    try {
      return await this.sourceModel.getById(id)
    } catch (error) {
      console.error('[SourceService][getById] Erro ao buscar campanha:', error)
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async updateTyp(sourceId: string, typId: string) {
    const source = await this.sourceModel.getById(sourceId)
    if (!source) throw AppError.notFound('Source não encontrada')

    if (source.typ_id === typId) {
      throw AppError.badRequest('Typ já vinculado a este source.')
    }

    const typ = await this.typModel.getById(typId)
    if (!typ) throw AppError.notFound('Typ não encontrado.')

    const updatedSource = await this.sourceModel.updateTyp(sourceId, typId)
    return updatedSource
  }

  async update(id: string, data: SourceBodyUpdateRequest) {
    try {
      const existingSource = await this.sourceModel.getById(id)

      if (!existingSource) {
        throw AppError.notFound('Source não encontrada')
      }

      const updatedSource = await this.sourceModel.update(id, data)
      return updatedSource
    } catch (error) {
      console.error(
        '[SourceService][update] Erro ao atualizar campanha:',
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
      return await this.sourceModel.delete(id)
    } catch (error) {
      console.error('[SourceService][delete] Erro ao deletar campanha:', error)
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }
}
