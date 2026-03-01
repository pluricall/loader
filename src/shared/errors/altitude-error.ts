export class AltitudeApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 502, details?: any) {
    super(message);
    this.name = "AltitudeApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}
