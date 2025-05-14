import fastify from 'fastify'
import cors from '@fastify/cors'
import { prisma } from './config/prisma'
import { sourceRoutes, campaignRoutes, loadRoutes } from './routes'
import { env } from './env'
import { errorHandler } from './middlewares/ErrorHandler'
import { typRoutes } from './routes/typ'
import { altitudeRoutes } from './routes/altitude'
import { leadsRoutes } from './routes/leads'
import mssqlPlugin from './plugins/mssql'
import { agilidadeLeadsJob } from './jobs/agilidade'
import { McSonaeJobs } from './jobs/mc_sonae'

const app = fastify({
  logger: true,
  requestTimeout: 0,
})

app.register(cors, {
  origin: ['https://agent.tejo.cc'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
})

app.register(async () => {
  agilidadeLeadsJob(app)
  McSonaeJobs(app)
})

app.setErrorHandler(errorHandler)
app.decorate('prisma', prisma)

app.register(
  function (app, _, done) {
    app.register(sourceRoutes, { prefix: 'bd' })
    app.register(campaignRoutes, { prefix: 'bd' })
    app.register(typRoutes, { prefix: 'bd' })
    app.register(altitudeRoutes, { prefix: 'altitude' })
    app.register(loadRoutes, { prefix: 'load' })
    app.register(leadsRoutes, { prefix: 'leads' })
    done()
  },
  { prefix: 'api' },
)
    const today = new Date().toISOString().split('T')[0]
const server = async () => {
  try {
    await app.register(mssqlPlugin)
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`🚀 Server is running on ${env.BASE_URL}, ${today}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

server()
