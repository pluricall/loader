import { IAgilidadeRepository } from "../../../domain/repositories/agilidade-repository";
import { ILogger } from "../../../../../core/logger/interfaces/logger.types";
import { SendContractsPayload } from "../../../http/schemas/agilidade-contracts.schema";
import { AgilidadeSendContractsService } from "../../../../../shared/infra/providers/agilidade/send-contracts";

export class AgilidadeContractsUseCase {
  constructor(
    private agilidadeRepository: IAgilidadeRepository,
    private agilidadeApiService: AgilidadeSendContractsService,
    private logger: ILogger,
  ) {}

  async execute(payload: SendContractsPayload): Promise<void> {
    this.validatePayload(payload);

    this.logger.info(
      {
        id: payload.Id,
        status: payload.Status,
        marca: payload.Marca,
        colaborador: payload.NomeColaborador,
      },
      "Iniciando envio de assinatura",
    );

    try {
      await this.logSuccess(payload);

      await this.logSuccess(payload);
    } catch (err) {
      if (err instanceof Error) {
        await this.logError(payload, err);
        throw err;
      }
    }
  }

  private validatePayload(payload: SendContractsPayload): void {
    if (payload.Status === "Sem Interesse" && !payload.MotivoNaoInteresse) {
      throw new Error(
        'MotivoNaoInteresse é obrigatório quando Status = "Sem Interesse"',
      );
    }

    if (!payload.Beneficiarios || payload.Beneficiarios.length === 0) {
      throw new Error("Pelo menos 1 beneficiário é obrigatório");
    }
  }

  private buildLogBase(payload: SendContractsPayload) {
    return {
      lead_id: payload.Id,
      colaborador: payload.NomeColaborador,
      marca: payload.Marca,
      status: payload.Status,
      telefone: payload.Telefone,
      email: payload.Email,
      data_assinatura: payload.DataAssinatura,
      periodicidade: payload.Periodicidade,
      valor_ativacao: payload.ValorAtivacao,
      mensalidade: payload.Mensalidade,
      num_beneficiarios: payload.Beneficiarios.length,
    };
  }

  private async logSuccess(payload: SendContractsPayload): Promise<void> {
    this.logger.info(
      { id: payload.Id, status: payload.Status, marca: payload.Marca },
      "Contrato enviado com sucesso",
    );

    await this.agilidadeRepository.saveSendContractsLog({
      ...this.buildLogBase(payload),
      send_status: "SUCCESS",
      body: JSON.stringify(payload),
    });
  }

  private async logError(
    payload: SendContractsPayload,
    err: Error & { response?: { status: number } },
  ): Promise<void> {
    const isApiError = !!err.response;

    this.logger.error(
      {
        id: payload.Id,
        error_type: isApiError ? "API" : "SYSTEM",
        http_status: err.response?.status,
        message: err.message,
      },
      "Falha ao enviar contrato",
    );

    await this.agilidadeRepository.saveSendContractsLog({
      ...this.buildLogBase(payload),
      send_status: "ERROR",
      error_type: isApiError ? "API" : "SYSTEM",
      error_message: err.message,
      ...(err.response && { http_status: err.response.status }),
      body: JSON.stringify(payload),
    });
  }
}
