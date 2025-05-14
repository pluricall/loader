import { FastifyInstance } from 'fastify'
import { CampaignController } from '../modules/bd/controllers/CampaignController'

const campaignController = new CampaignController()

export async function campaignRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/campaign/register',
    campaignController.create.bind(campaignController),
  )
  fastify.get('/campaign', campaignController.getAll.bind(campaignController))
  fastify.get(
    '/campaign/:id',
    campaignController.getById.bind(campaignController),
  )
  fastify.put(
    '/campaign/update/:id',
    campaignController.update.bind(campaignController),
  )
  fastify.delete(
    '/campaign/delete/:id',
    campaignController.delete.bind(campaignController),
  )
}
