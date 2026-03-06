import axios from "axios";
import https from "https";
import { AltitudeApiError } from "../../../errors/altitude-error";
import {
  AltitudeEnvironment,
  resolveAltitudeConfig,
} from "../../../utils/resolve-altitude-config";
import { AltitudeAuthService } from "./auth.service";

interface UploadContactParams {
  payload: any;
  environment: AltitudeEnvironment;
}

export class AltitudeUploadContact {
  constructor(private altitudeAuthService: AltitudeAuthService) {}

  async execute({ payload, environment }: UploadContactParams) {
    const config = resolveAltitudeConfig(environment);
    const token = await this.altitudeAuthService.getToken(environment);

    try {
      const resp = await axios.post(
        `${config.baseUrl}/api/instance/campaignManager/uploadContacts`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        },
      );

      return resp.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.altitudeAuthService.invalidateToken(environment);

        const newToken = await this.altitudeAuthService.getToken(environment);

        const retry = await axios.post(
          `${config.baseUrl}/api/instance/campaignManager/uploadContacts`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          },
        );

        return retry.data;
      }

      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error_description ||
          JSON.stringify(error.response.data);

        throw new AltitudeApiError(
          message,
          error.response.status,
          error.response.data,
        );
      }

      throw new AltitudeApiError("Altitude unreachable");
    }
  }
}
