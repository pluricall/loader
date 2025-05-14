export enum HttpStatus {
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  UNAUTHORIZED = 401,
  CONFLICT = 409,
}

export interface IAppError {
  error: string
  status: number
  details: any
}

export class AppError extends Error implements IAppError {
  error: string
  status: number
  details: any

  private constructor(message: string, status: number, details?: any) {
    super(message)
    this.error = message
    this.status = status
    this.details = details
  }

  static badRequest(message: string, details?: any) {
    return new AppError(message, HttpStatus.BAD_REQUEST, details)
  }

  static conflict(message: string, details?: any) {
    return new AppError(message, HttpStatus.CONFLICT, details)
  }

  static notFound(message: string, details?: any) {
    return new AppError(message, HttpStatus.NOT_FOUND, details)
  }

  static internal(message: string, details?: any) {
    return new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR, details)
  }

  static forbidden(message: string, details?: any) {
    return new AppError(message, HttpStatus.FORBIDDEN, details)
  }

  static unauthorized(message: string, details?: any) {
    return new AppError(message, HttpStatus.UNAUTHORIZED, details)
  }
}
