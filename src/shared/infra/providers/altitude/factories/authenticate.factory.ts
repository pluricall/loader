import { AltitudeAuthService } from "../auth.service";

export function AltitudeAuthServiceFactory() {
  const altitudeAuthService = new AltitudeAuthService();
  return altitudeAuthService;
}
