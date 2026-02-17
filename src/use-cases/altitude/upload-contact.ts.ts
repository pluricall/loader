import axios from "axios";
import https from "https";
import { AltitudeAuthService } from "./authenticate";
import { AltitudeApiError } from "../errors/altitude-error";

export class AltitudeUploadContact {
  constructor(
    private baseUrl: string,
    private authService: AltitudeAuthService,
  ) {}

  async execute(payload: {
    campaignName: string;
    requests: Array<{ RequestType: string; Value: any }>;
  }) {
    const token = await this.authService.getToken();

    try {
      const resp = await axios.post(
        `${this.baseUrl}/instance/campaignManager/uploadContacts`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return resp.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        const newToken = await this.authService.getToken();

        const retry = await axios.post(
          `${this.baseUrl}/instance/campaignManager/uploadContacts`,
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
        throw new AltitudeApiError(error.response.status, error.response.data);
      }

      // erro de rede / timeout
      throw new AltitudeApiError(503, {
        message: "Altitude unreachable",
      });
    }
  }
}
