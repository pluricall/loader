import { FastifyReply, FastifyRequest } from 'fastify'
import { SourceService } from '../services/SourceService'
import {
  SourceBodyRequest,
  SourceBodyUpdateRequest,
  SourceSchema,
} from '../schemas/SourceSchema'
import { AppError } from '../../../errors/AppError'
import { sourceServiceInstance } from '../services/instances'

export class SourceController {
  constructor(private sourceService: SourceService = sourceServiceInstance) {}

  private validateBody(body: SourceBodyRequest | SourceBodyUpdateRequest) {
    const parseResult = SourceSchema.safeParse(body)
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
    request: FastifyRequest<{ Body: SourceBodyRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const validatedData = this.validateBody(request.body)
      const createdBD = await this.sourceService.create(validatedData)
      reply.status(201).send(createdBD.id)
    } catch (error) {
      console.error('[SourceController][create] Erro ao criar campanha:', error)
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
      const bd = await this.sourceService.getById(id)

      if (!bd) {
        throw AppError.notFound('Id do source não encontrado.')
      }

      reply.send(bd)
    } catch (error) {
      console.error(
        '[SourceController][getById] Erro ao criar campanha:',
        error,
      )

      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }

      throw error
    }
  }

  async updateTyp(
    request: FastifyRequest<{
      Params: { id: string }
      Body: { typId: string }
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params
      const { typId } = request.body

      const updatedSource = await this.sourceService.updateTyp(id, typId)
      reply.status(200).send(updatedSource)
    } catch (error) {
      console.error('[SourceController][updateTyp] Erro:', error)
      if (!(error instanceof AppError)) throw AppError.internal('Erro interno.')
      throw error
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { campaignId: string; id: string }
      Body: SourceBodyUpdateRequest
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { campaignId, id } = request.params

      const validatedData = this.validateBody(request.body)

      const existingBD = await this.sourceService.getById(id)

      if (!existingBD) {
        throw AppError.notFound('Id do source não encontrado.')
      }

      if (existingBD.campaign_id !== campaignId) {
        throw AppError.forbidden(
          'Este source não pertence a campanha informada.',
        )
      }

      const updatedBD = await this.sourceService.update(id, validatedData)
      reply.send(updatedBD)
    } catch (error) {
      console.error(
        '[SourceController][update] Erro ao atualizar source:',
        error,
      )

      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }

      throw error
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { campaignId: string; id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { campaignId, id } = request.params

      const existingBD = await this.sourceService.getById(id)
      if (!existingBD) {
        throw AppError.notFound('Id do source não encontrado.')
      }

      if (existingBD.campaign_id !== campaignId) {
        throw AppError.forbidden(
          'Este Id do source não pertence o. campanha informada.',
        )
      }

      await this.sourceService.delete(id)
      reply.send().status(204)
    } catch (error) {
      console.error('[SourceController][delete] Erro ao criar campanha:', error)

      if (!(error instanceof AppError)) {
        throw AppError.internal('Erro no servidor.')
      }

      throw error
    }
  }
}
