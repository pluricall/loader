import axios from "axios";
import { IberdrolaRepository } from "../repositories/iberdrola.repository";
import { env } from "../../../env";

interface SenderRegisteredSmsResponse {
  request: string;
  code: number;
  newcredit: number;
  status: string;
}

interface SenderRegisteredSmsRequest {
  phoneNumber: string;
  message: string;
  easycode: string;
  campaign: string;
}

export class SenderRegisteredIberdrolaSmsUseCase {
  constructor(private iberdrolaRepository: IberdrolaRepository) {}
  async execute({
    phoneNumber,
    message,
    easycode,
    campaign,
  }: SenderRegisteredSmsRequest): Promise<SenderRegisteredSmsResponse> {
    const response = await axios.post<SenderRegisteredSmsResponse>(
      "https://api.lleida.net/sms/v2/",
      {
        sms: {
          user: env.LLEIDA_USER,
          password: env.LLEIDA_PASS ?? "",
          request_id: easycode,
          txt: message,
          dst: { num: [phoneNumber] },
          delivery_receipt: {
            lang: "PT",
            cert_type: "T",
            cert_name: "",
            cert_name_id: "",
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `x-api-key ${env.LLEIDA_API_KEY}`,
        },
      },
    );

    if (response.data.status !== "Success") {
      throw new Error(
        `Erro ao enviar SMS registrado: ${response.data.status} (Código: ${response.data.code})`,
      );
    }

    await this.iberdrolaRepository.sendedMessages({
      contractId: easycode,
      phoneNumber,
      message,
      easycode,
      campaign,
    });

    return response.data;
  }
}
