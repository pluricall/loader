import { FastifyInstance } from 'fastify'
import { LeadsController } from '../modules/leads/LeadsController'

const leadsController = new LeadsController()

export async function leadsRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/agilidade',
    leadsController.AgilidadeLeads.bind(leadsController),
  )
}
