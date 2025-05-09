import { FastifyRequest, FastifyReply } from 'fastify'
import { TypService } from '../services/TypService'
import { typServiceInstance } from '../services/instances'
import { TypBodyRequest, TypSchema } from '../schemas/TypSchema'
import { AppError } from '../../../errors/AppError'

export class TypController {
  constructor(private typService: TypService = typServiceInstance) {}

  private validateBody(body: TypBodyRequest) {
    const parseResult = TypSchema.safeParse(body)
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
    request: FastifyRequest<{ Body: TypBodyRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const validatedData = this.validateBody(request.body)
      const typ = await this.typService.create(validatedData)
      reply.status(201).send(typ.id)
    } catch (error) {
      console.error('[TypController][create] Erro:', error)
      if (!(error instanceof AppError)) throw AppError.internal('Erro interno.')
      throw error
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const typList = await this.typService.getAll()
    reply.send(typList)
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params
    const typ = await this.typService.getById(id)
    reply.send(typ)
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: TypBodyRequest }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params
    const validatedData = this.validateBody(request.body)
    const updatedTyp = await this.typService.update(id, validatedData)
    reply.send(updatedTyp)
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params
    await this.typService.delete(id)
    reply.status(204).send()
  }
}
