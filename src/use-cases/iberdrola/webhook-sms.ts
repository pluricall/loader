import {
  IberdrolaRepository,
  WebhookSmsResponse,
} from "../../repositories/iberdrola-repository";

export class IberdrolaWebhookSmsUseCase {
  constructor(private iberdrolaRepository: IberdrolaRepository) {}

  async execute({
    fecha,
    udh,
    texto,
    idmo,
    esm_class,
    destino,
    data_coding,
    origen,
  }: WebhookSmsResponse) {
    const response = await this.iberdrolaRepository.webhookSmsResponse({
      fecha,
      udh,
      texto,
      idmo,
      esm_class,
      destino,
      data_coding,
      origen,
    });

    return response;
  }
}
