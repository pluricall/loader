import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError, HttpStatus, IAppError } from '../errors/AppError'

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (isAppError(error)) {
    return reply.status(error.status).send({
      error: error.error,
      status: error.status,
      details: error.details ?? null,
    })
  }

  const internalError = AppError.internal(
    'Erro interno inesperado',
    HttpStatus.INTERNAL_SERVER_ERROR,
  )
  return reply.status(internalError.status).send({
    error: internalError.error,
    status: internalError.status,
    details: internalError.details ?? null,
  })
}

function isAppError(error: any): error is IAppError {
  return 'status' in error && 'error' in error
}
