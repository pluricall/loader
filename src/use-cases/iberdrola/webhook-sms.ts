import {
  IberdrolaRepository,
  WebhookSmsResponse,
} from "../../repositories/iberdrola-repository";

export class IberdrolaWebhookSmsUseCase {
  constructor(private iberdrolaRepository: IberdrolaRepository) {}

  async execute({ fecha, texto, idmo, destino, origen }: WebhookSmsResponse) {
    const cleanedDestino = destino ? destino.replace(/^\+351/, "").trim() : "";
    const cleanedOrigen = origen ? origen.replace(/^\+351/, "").trim() : "";

    await this.iberdrolaRepository.insertAnswer({
      contractId: idmo,
      response: texto,
      hostedNumber: cleanedOrigen,
      senderNumber: cleanedDestino,
      receivedAt: fecha,
    });

    return { success: true };
  }
}
