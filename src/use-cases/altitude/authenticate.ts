import axios from "axios";
import https from "https";
import { AltitudeAuthError } from "../errors/altitude-auth-error";

interface AltitudeTokenResponse {
  access_token: string;
  expires_in: number;
}

interface AltitudeAuthErrorResponse {
  error: string;
  error_description: string;
  error_uri: string | null;
}

export class AltitudeAuthService {
  private token: string | null = null;
  private expiresAt = 0;

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }

    return this.login();
  }

  private async login(): Promise<string> {
    try {
      const payload = new URLSearchParams({
        username: process.env.ALTITUDE_USER!,
        password: process.env.ALTITUDE_PASS!,
        grant_type: "password",
        instanceaddress: process.env.ALTITUDE_INSTANCE!,
        secureaccess: "false",
        authenticationType: "Uci",
        forced: "true",
        operation: "login",
      });

      const resp = await axios.post<AltitudeTokenResponse>(
        process.env.ALTITUDE_AUTH_URL!,
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          timeout: 10000,
        },
      );

      this.token = resp.data.access_token;
      this.expiresAt = Date.now() + (resp.data.expires_in - 60) * 1000;

      return this.token;
    } catch (err: any) {
      if (axios.isAxiosError<AltitudeAuthErrorResponse>(err)) {
        const data = err.response?.data;

        throw new AltitudeAuthError(
          err.response?.status ?? 500,
          data?.error,
          data?.error_description,
          data,
        );
      }

      throw new AltitudeAuthError(500, "unknown", err.message, err);
    }
  }
}
