import { IAgilidadeRepository } from "../../../domain/repositories/agilidade-repository";
import { ILogger } from "../../../../../core/logger/interfaces/logger.types";
import {
  SendContractsPayload,
  sendContractsSchema,
} from "../../../http/schemas/agilidade-contracts.schema";
import {
  AgilidadeSendContractsService,
  SendContractsResponse,
} from "../../../../../shared/infra/providers/agilidade/send-contracts";
import { AgilidadeContractsPayloadBuilder } from "./send-contracts-payload-builder";
import { AgilidadeContractsLogBuilder } from "./send-contracts-log.builder";

interface ExecuteBatchDTO {
  date: string;
}

interface ExecuteDTO {
  payload: SendContractsPayload;
  easycode: string;
}

interface BatchResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ easycode: string; reason: string }>;
}

export class AgilidadeContractsUseCase {
  constructor(
    private agilidadeRepository: IAgilidadeRepository,
    private agilidadeApiService: AgilidadeSendContractsService,
    private payloadBuilder: AgilidadeContractsPayloadBuilder,
    private logBuilder: AgilidadeContractsLogBuilder,
    private logger: ILogger,
  ) {}

  async executeBatch({ date }: ExecuteBatchDTO): Promise<BatchResult> {
    const leads = await this.agilidadeRepository.getLeadsParaEnviar(date);

    const results: BatchResult = {
      total: leads.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const ct of leads) {
      try {
        const venda = ct.resultado === "1";
        let payload: SendContractsPayload;

        if (!venda) {
          payload = this.payloadBuilder.buildNaoConvertida(ct);
          const { lead_id } = await this.execute({
            easycode: ct.easycode,
            payload,
          });

          if (!payload.Id) {
            await this.agilidadeRepository.updateLeadId(ct.easycode, lead_id);
          }
          results.success++;
          continue;
        }

        const principal = await this.agilidadeRepository.getAdesaoPrincipal(
          ct.easycode,
        );
        const secundarios =
          await this.agilidadeRepository.getAdesoesSecundarias(ct.easycode);

        if (!principal) {
          this.logger.warn({ easycode: ct.easycode }, "Sem titular");
          results.failed++;
          results.errors.push({ easycode: ct.easycode, reason: "Sem titular" });
          continue;
        }

        payload = this.payloadBuilder.buildConvertida(
          ct,
          principal,
          secundarios,
        );
        const { lead_id } = await this.execute({
          easycode: ct.easycode,
          payload,
        });

        if (!payload.Id) {
          await this.agilidadeRepository.updateLeadId(ct.easycode, lead_id);
        }
        results.success++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        this.logger.error(
          { easycode: ct.easycode, error: message },
          "Erro ao processar contrato",
        );
        results.failed++;
        results.errors.push({ easycode: ct.easycode, reason: message });
      }
    }

    return results;
  }

  async execute({
    easycode,
    payload,
  }: ExecuteDTO): Promise<SendContractsResponse> {
    sendContractsSchema.parse(payload);

    this.logger.info(
      {
        id: payload.Id,
        status: payload.Status,
        marca: payload.Marca,
        colaborador: payload.NomeColaborador,
        easycode,
      },
      "Iniciando envio de assinatura",
    );

    try {
      const response = await this.agilidadeApiService.sendSubscription(payload);

      await this.logSuccess(payload, easycode, response).catch((err) =>
        this.logger.error(
          { easycode, error: err.message },
          "Falha ao guardar log de sucesso",
        ),
      );

      this.logger.info(
        { id: payload.Id, easycode, status: payload.Status },
        "Contrato enviado com sucesso",
      );
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");

      await this.logError(payload, easycode, error).catch((logErr) =>
        this.logger.error(
          { easycode, error: logErr.message },
          "Falha ao guardar log de erro",
        ),
      );

      throw error;
    }
  }

  private async logSuccess(
    payload: SendContractsPayload,
    easycode: string,
    response: SendContractsResponse,
  ): Promise<void> {
    await this.agilidadeRepository.saveSendContractsLog({
      ...this.logBuilder.build(payload, easycode),
      send_status: "SUCCESS",
      body: JSON.stringify(payload),
      api_response: response.raw,
    });
  }

  private async logError(
    payload: SendContractsPayload,
    easycode: string,
    err: Error & { response?: { status: number } },
  ): Promise<void> {
    await this.agilidadeRepository.saveSendContractsLog({
      ...this.logBuilder.build(payload, easycode),
      send_status: "ERROR",
      error_type: err.response ? "API" : "SYSTEM",
      api_response: err.message,
      ...(err.response && { http_status: err.response.status }),
      body: JSON.stringify(payload),
    });
  }
}
