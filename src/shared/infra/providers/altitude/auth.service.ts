import axios from "axios";
import https from "https";
import { AltitudeAuthError } from "../../../errors/altitude-auth-error";
import {
  AltitudeEnvironment,
  resolveAltitudeConfig,
} from "../../../utils/resolve-altitude-config";

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
  private loginPromise: Promise<string> | null = null;

  async getToken(environment: AltitudeEnvironment): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }

    if (this.loginPromise) {
      return this.loginPromise;
    }

    this.loginPromise = this.login(environment);

    const token = await this.loginPromise;
    this.loginPromise = null;

    return token;
  }

  private async login(
    environment: "cloud" | "onprem" | "pre",
  ): Promise<string> {
    try {
      const config = resolveAltitudeConfig(environment);
      const payload = new URLSearchParams({
        username: config.username,
        password: config.password,
        grant_type: "password",
        instanceaddress: config.instance,
        secureaccess: "false",
        authenticationType: "Uci",
        forced: "true",
        operation: "login",
      });

      const resp = await axios.post<AltitudeTokenResponse>(
        `${config.baseUrl}/token`,
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

export function AltitudeAuthServiceFactory() {
  const altitudeAuthService = new AltitudeAuthService();
  return altitudeAuthService;
}
