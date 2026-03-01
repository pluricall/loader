export class AltitudeAuthError extends Error {
  constructor(
    public statusCode: number,
    public code?: string,
    public description?: string,
    public raw?: any,
  ) {
    super(description || "Altitude auth error");
  }
}
