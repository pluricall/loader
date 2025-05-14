import { FastifyInstance } from 'fastify'
import { SourceController } from '../modules/bd/controllers/SourceController'

const sourceController = new SourceController()

export async function sourceRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/campaign/:campaignId/source/:id',
    sourceController.getById.bind(sourceController),
  )
  fastify.post(
    '/campaign/:campaignId/source/register',
    sourceController.create.bind(sourceController),
  )
  fastify.put(
    '/campaign/:campaignId/source/update/:id',
    sourceController.update.bind(sourceController),
  )
  fastify.delete(
    '/campaign/:campaignId/source/:id',
    sourceController.delete.bind(sourceController),
  )
  fastify.patch(
    '/source/:id/typ',
    sourceController.updateTyp.bind(sourceController),
  )
}
