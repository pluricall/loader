import { AltitudeAuthService } from "../altitude/authenticate";
import { AltitudeCreateContact } from "../altitude/create-contact";

export function makeAltitudeCreateContact() {
  const auth = new AltitudeAuthService();

  return new AltitudeCreateContact(process.env.ALTITUDE_API_BASE!, auth);
}
