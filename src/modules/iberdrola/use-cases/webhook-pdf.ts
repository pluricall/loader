import {
  IberdrolaRepository,
  WebhookPdfResponse,
} from "../repositories/iberdrola.repository";

export class IberdrolaWebhookPdfUseCase {
  constructor(private iberdrolaRepository: IberdrolaRepository) {}

  async execute({
    cert_type,
    dst,
    event,
    lang,
    mo,
    mt,
    mt_id,
    ref_tsa,
    src,
  }: WebhookPdfResponse) {
    const response = await this.iberdrolaRepository.webhookPdfResponse({
      cert_type,
      dst,
      event,
      lang,
      mo,
      mt,
      mt_id,
      ref_tsa,
      src,
    });

    return response;
  }
}
