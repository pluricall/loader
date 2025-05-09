import { FastifyInstance } from 'fastify'
import { LoadService } from '../modules/load/LoadService'

const loadService = new LoadService()

export async function loadRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const { campaignId } = request.body as { campaignId: string }
    const result = await loadService.uciLoaderCampaignById(campaignId)
    reply.send(result)
  })
}
