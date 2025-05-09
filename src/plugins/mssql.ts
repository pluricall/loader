import fp from 'fastify-plugin'
import sql from 'mssql'

const dbConfig = {
  user: 'relatorios',
  password: 's@,bXac~}7cMXad!',
  server: '192.168.0.170',
  port: 49493,
  database: 'easy8',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
}

export default fp(async (fastify) => {
  const pool = await sql.connect(dbConfig)
  fastify.decorate('mssql', pool)

  fastify.addHook('onClose', async () => {
    await pool.close()
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    mssql: sql.ConnectionPool
  }
}
