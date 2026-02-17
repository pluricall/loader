export class AltitudeApiError extends Error {
  constructor(
    public statusCode: number,
    public details: any,
  ) {
    super("Altitude API error");
  }
}
