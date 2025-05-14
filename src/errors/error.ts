export class CustomError extends Error {
  public status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status

    this.name = this.constructor.name

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }
  }
}
