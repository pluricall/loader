import axios from "axios";
import { PlenitudeAuthService } from "./authenticate";
import { PluricallRepository } from "../../repositories/pluricall-repository";

export class PlenitudeInsert {
  constructor(
    private plenitudeAuthService: PlenitudeAuthService,
    private mssqlRepository: PluricallRepository,
  ) {}

  async execute(
    usuario: string,
    pass: string,
    digitalData: any,
    version: string = "3.0.0",
  ) {
    const endpoint = "/insertar/digital";
    let responsePayload = null;
    let statusCode = 200;
    let errorMessage: string | undefined;

    try {
      const { token, idDistribuidor } =
        await this.plenitudeAuthService.getToken(usuario, pass, version);

      const payload = {
        accessToken: token,
        version: "3.0.0",
        distribuidor: idDistribuidor,
        ...digitalData,
      };

      const insertUrl = `${this.plenitudeAuthService.getBaseUrlPublic()}/insertar/digital`;
      const resp = await axios.post(insertUrl, payload);

      responsePayload = resp.data;
      statusCode = 200;

      return resp.data;
    } catch (err: any) {
      if (err.response) {
        responsePayload = err.response.data;
        statusCode = err.response.status;
        errorMessage = err.message;
      } else {
        statusCode = 500;
        errorMessage = err.message;
      }
      throw err;
    } finally {
      await this.mssqlRepository.logPlenitudeCallCloud({
        usuario,
        endpoint,
        requestPayload: digitalData,
        responsePayload,
        statusCode,
        errorMessage,
      });
    }
  }
}
