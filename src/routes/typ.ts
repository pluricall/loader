import { FastifyInstance } from 'fastify'
import { TypController } from '../modules/bd/controllers/TypController'

const typController = new TypController()

export async function typRoutes(fastify: FastifyInstance) {
  fastify.post('/typ/register', typController.create.bind(typController))
  fastify.get('/typ', typController.getAll.bind(typController))
  fastify.get('/typ/:id', typController.getById.bind(typController))
  fastify.put('/typ/update/:id', typController.update.bind(typController))
  fastify.delete('/typ/delete/:id', typController.delete.bind(typController))
}
