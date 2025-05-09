import { FastifyReply, FastifyRequest } from 'fastify'
import { CampaignService } from '../services/CampaignService'
import { CampaignSchema, CampaignBodyRequest } from '../schemas/CampaignSchema'
import { AppError } from '../../../errors/AppError'
import { campaignServiceInstance } from '../services/instances'

export class CampaignController {
  constructor(
    private campaignService: CampaignService = campaignServiceInstance,
  ) {}

  private validateBody(body: CampaignBodyRequest) {
    const parseResult = CampaignSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      throw AppError.badRequest('Erro de validação', errors)
    }
    return parseResult.data
  }

  async create(
    request: FastifyRequest<{ Body: CampaignBodyRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const validatedData = this.validateBody(request.body)
      const createdCampaign = await this.campaignService.create(validatedData)
      reply.status(201).send(createdCampaign.id)
    } catch (error) {
      console.error(
        '[CampaignController][create] Erro ao criar campanha:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }

      throw error
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params
      const campaign = await this.campaignService.getById(id)

      if (!campaign) {
        throw AppError.notFound('Campanha não encontrada.')
      }

      reply.send(campaign)
    } catch (error) {
      console.error(
        '[CampaignController][getById] Erro ao buscar campanha:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const campaign = await this.campaignService.getAll()
      reply.send({ campaigns: campaign })
    } catch (error) {
      console.error(
        '[CampaignController][getAll] Erro ao buscar campanhas:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string }
      Body: CampaignBodyRequest
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params
      const validatedData = this.validateBody(request.body)

      const existing = await this.campaignService.getById(id)
      if (!existing) {
        throw AppError.notFound('Campanha não encontrada')
      }

      const updated = await this.campaignService.update(id, validatedData)
      reply.send(updated)
    } catch (error) {
      console.error(
        '[CampaignController][update] Erro ao atualizar campanha:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params
      const existing = await this.campaignService.getById(id)

      if (!existing) {
        throw AppError.notFound('Campanha não encontrada')
      }

      await this.campaignService.delete(id)
      reply.send().status(204)
    } catch (error) {
      console.error(
        '[CampaignController][delete] Erro ao deletar campanha:',
        error,
      )
      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }
      throw error
    }
  }
}
