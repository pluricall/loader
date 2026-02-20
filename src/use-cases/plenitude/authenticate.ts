import axios from "axios";
import { PlenitudeLoginError } from "../errors/plenitude-login-error";

interface PlenitudeLoginResponse {
  IdError: number;
  Data: {
    id_usuario: string;
    token: string;
    pais: string;
    sips_nombre_apellidos: string;
    sips_cups: string;
    seguro_bibe: string;
    id_distribuidor: string;
    renovaciones_app: string;
  };
  Errores?: string[];
  Error?: string;
}

export class PlenitudeAuthService {
  private token: string | null = null;
  private tokenExpiresAt = 0;
  private idDistribuidor: string | null = null;

  constructor(private environment: "prod" | "test" = "prod") {}

  private getBaseUrl() {
    return this.environment === "test"
      ? "https://testwsd.eniplenitude.es/webservice"
      : "https://wsd.eniplenitude.es/webservice";
  }

  async getToken(usuario: string, pass: string, version: string = "3.0.0") {
    if (this.token && Date.now() < this.tokenExpiresAt && this.idDistribuidor) {
      return { token: this.token, idDistribuidor: this.idDistribuidor };
    }

    const loginUrl = `${this.getBaseUrl()}/login`;

    try {
      const resp = await axios.post<PlenitudeLoginResponse>(loginUrl, {
        usuario,
        pass,
        version,
      });

      if (resp.data.IdError !== 0) {
        throw new PlenitudeLoginError(
          resp.data.Errores?.join(", ") ||
            resp.data.Error ||
            "Erro de login Plenitude",
        );
      }

      this.token = resp.data.Data.token;
      this.idDistribuidor = resp.data.Data.id_distribuidor;
      this.tokenExpiresAt = Date.now() + 6 * 60 * 60 * 1000; // 6h

      return { token: this.token, idDistribuidor: this.idDistribuidor };
    } catch (err: any) {
      if (err.response?.data) {
        throw new PlenitudeLoginError(
          `HTTP ${err.response.status}: ${err.response.data.Errores?.join(", ")}`,
        );
      }
      throw err;
    }
  }

  getDistribuidor() {
    if (!this.idDistribuidor)
      throw new PlenitudeLoginError("Distribuidor não definido");
    return this.idDistribuidor;
  }

  getBaseUrlPublic() {
    return this.getBaseUrl();
  }
}
