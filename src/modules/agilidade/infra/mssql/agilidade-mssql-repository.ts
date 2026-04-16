// src/repositories/agilidade-repository.ts
import { connectPluricallDb } from "../../../../shared/infra/db/connect-pluricall";
import {
  ContractsLogData,
  IAgilidadeRepository,
  RecordingRow,
  RecordingSendLog,
  SendRecordingsToClientApiRequest,
} from "../../domain/repositories/agilidade-repository";
import { AgilidadeLead } from "../../domain/entities/lead";
import { AgilidadeMapper } from "../mappers/agilidade-mapper";

export class AgilidadeMssqlRepository implements IAgilidadeRepository {
  async save(
    lead: AgilidadeLead,
    requestIp: string,
    requestUrl: string,
  ): Promise<void> {
    const record = AgilidadeMapper.toPersistence(lead, requestIp, requestUrl);
    const conn = await connectPluricallDb("onprem");

    await conn
      .request()
      .input("timestamp", record.timestamp)
      .input("request_ip", record.request_ip)
      .input("request_url", record.request_url)
      .input("gen_id", record.gen_id)
      .input("campanha_easy", record.campanha_easy)
      .input("contact_list_easy", record.contact_list_easy)
      .input("bd_easy", record.bd_easy)
      .input("mapping_template", record.mapping_template)
      .input("raw_phone_number", record.raw_phone_number)
      .input("phone_number", record.phone_number)
      .input("lead_status", record.lead_status)
      .input("nome", record.nome)
      .input("email", record.email)
      .input("lead_id", record.lead_id)
      .input("dist_id", record.dist_id)
      .input("created_date", record.created_date)
      .input("posted_date", record.posted_date)
      .input("city", record.city)
      .input("ad_id", record.ad_id)
      .input("adset_id", record.adset_id)
      .input("campaign_id", record.campaign_id)
      .input("ad_name", record.ad_name)
      .input("campaign_name", record.campaign_name)
      .input("adset_name", record.adset_name)
      .input("form_id", record.form_id)
      .input("formdata", String(record.formdata)).query(`
        INSERT INTO agilidade_leads_repository (
          timestamp,
          request_ip,
          request_url,
          gen_id,
          campanha_easy,
          contact_list_easy,
          bd_easy,
          mapping_template,
          raw_phone_number,
          phone_number,
          lead_status,
          nome,
          email,
          lead_id,
          dist_id,
          created_date,
          posted_date,
          city,
          ad_id,
          adset_id,
          campaign_id,
          ad_name,
          campaign_name,
          adset_name,
          form_id,
          formdata
        )
        VALUES (
          @timestamp,
          @request_ip,
          @request_url,
          @gen_id,
          @campanha_easy,
          @contact_list_easy,
          @bd_easy,
          @mapping_template,
          @raw_phone_number,
          @phone_number,
          @lead_status,
          @nome,
          @email,
          @lead_id,
          @dist_id,
          @created_date,
          @posted_date,
          @city,
          @ad_id,
          @adset_id,
          @campaign_id,
          @ad_name,
          @campaign_name,
          @adset_name,
          @form_id,
          @formdata
        )
      `);
  }

  async updateStatus(gen_id: string, lead_status: string): Promise<void> {
    const conn = await connectPluricallDb("onprem");
    await conn
      .request()
      .input("gen_id", gen_id)
      .input("lead_status", lead_status).query(`
        UPDATE agilidade_leads_repository
        SET lead_status = @lead_status
        WHERE gen_id = @gen_id
      `);
  }

  async getRecordingsByDay(data: SendRecordingsToClientApiRequest) {
    const conn = await connectPluricallDb("onprem");
    const result = await conn.request().query(`
        BEGIN
    SET NOCOUNT ON; 

    DECLARE @dataini  DATETIME = '${data.initialDate} 00:00:00';
    DECLARE @datafim  DATETIME = '${data.endDate} 23:59:59';
    DECLARE @include_historical BIT = ${data.includeHistorical ? 1 : 0};

    IF OBJECT_ID('tempdb..#BASE') IS NOT NULL DROP TABLE #BASE;
    IF OBJECT_ID('tempdb..#EASYCODES') IS NOT NULL DROP TABLE #EASYCODES;

    CREATE TABLE #EASYCODES (
        easycode INT PRIMARY KEY,
        primeira_venda DATETIME
    );

    INSERT INTO #EASYCODES (easycode, primeira_venda)
SELECT
    easycode,
    MIN(datacontacto)
FROM ct_agilidade_leads WITH (NOLOCK)
WHERE resultado = '1'
  AND datacontacto >= @dataini
  AND datacontacto <  @datafim
GROUP BY easycode;

    SELECT
        CT.easycode,
        CT.telefone_,
        CT.telemovel_,
        CT.logincontacto,
        CT.duracao,
        CT.bd_id,
        CT.resultado,
        CT.datacontacto,
        itr_record.recording_key,
        itr_record.start_time AS recording_moment,
        0 AS is_historical
    INTO #BASE
    FROM itr_recording itr_record WITH (NOLOCK)
    INNER JOIN ct_agilidade_leads CT WITH (NOLOCK)
        ON itr_record.contact = CT.easycode
    WHERE itr_record.start_time >= @dataini
      AND itr_record.start_time <  @datafim;

    IF @include_historical = 1
    BEGIN
        INSERT INTO #BASE (
            easycode,
            telefone_,
            telemovel_,
            logincontacto,
            duracao,
            bd_id,
            resultado,
            datacontacto,
            recording_key,
            recording_moment,
            is_historical
        )
        SELECT
            CT.easycode,
            CT.telefone_,
            CT.telemovel_,
            CT.logincontacto,
            CT.duracao,
            CT.bd_id,
            CT.resultado,
            CT.datacontacto,
            itr_record.recording_key,
            itr_record.start_time,
            1
        FROM itr_recording itr_record WITH (NOLOCK)
        INNER JOIN ct_agilidade_leads CT WITH (NOLOCK)
            ON itr_record.contact = CT.easycode
		 INNER JOIN #EASYCODES E
            ON E.easycode = CT.easycode
        WHERE itr_record.start_time IS NOT NULL
          AND (
                E.primeira_venda IS NULL
                OR itr_record.start_time < E.primeira_venda
          );
    END

    SELECT
        ACT.easycode,
        COALESCE(NULLIF(ACT.telefone_, ''), ACT.telemovel_) AS telefone,
        ACT.logincontacto,
        ACT.duracao,
        ACT.bd_id,
        ACT.recording_key,
        ACT.recording_moment AS moment,

        thg.itr_key           AS global_recording_key,
        th.itr_global         AS global_interaction,
        th.code               AS interaction_id,

        th.start_time         AS call_start,
        th.termination_state,

        ACT.resultado,
        ACT.is_historical,

        th.contact_profile,
        th.media_type,
        th.origin,
        thg.disconnection_type

    FROM #BASE ACT
INNER JOIN itr_thread th WITH (NOLOCK)
    ON th.contact = ACT.easycode
INNER JOIN itr_global thg WITH (NOLOCK)
    ON thg.code = th.itr_global
WHERE th.start_time IS NOT NULL
END;
      `);

    const rows: RecordingRow[] = result.recordset;
    return rows;
  }

  async saveSendRecordingLog(data: RecordingSendLog): Promise<void> {
    const conn = await connectPluricallDb("onprem");

    await conn
      .request()
      .input("recording_key", data.recording_key)
      .input("easycode", data.easycode)
      .input("telefone", data.telefone)
      .input("bd_id", data.bd_id)
      .input("file_name", data.file_name)
      .input("origem_path", data.origem_path)
      .input("status", data.status)
      .input("error_type", data.error_type ?? null)
      .input("error_message", data.error_message ?? null)
      .input("http_status", data.http_status ?? null).query(`
      INSERT INTO agilidade_recordings_repository (
        recording_key,
        easycode,
        telefone,
        bd_id,
        file_name,
        origem_path,
        status,
        error_type,
        error_message,
        http_status
      )
      VALUES (
        @recording_key,
        @easycode,
        @telefone,
        @bd_id,
        @file_name,
        @origem_path,
        @status,
        @error_type,
        @error_message,
        @http_status
      )
    `);
  }

  async saveSendContractsLog(data: ContractsLogData): Promise<void> {
    const conn = await connectPluricallDb("onprem");

    await conn
      .request()
      .input("lead_id", data.lead_id)
      .input("colaborador", data.colaborador)
      .input("marca", data.marca)
      .input("status", data.status)
      .input("telefone", data.telefone)
      .input("email", data.email)
      .input("data_assinatura", data.data_assinatura)
      .input("periodicidade", data.periodicidade)
      .input("valor_ativacao", data.valor_ativacao)
      .input("mensalidade", data.mensalidade)
      .input("num_beneficiarios", data.num_beneficiarios)
      .input("send_status", data.send_status)
      .input("error_type", data.error_type ?? null)
      .input("error_message", data.error_message ?? null)
      .input("http_status", data.http_status ?? null)
      .input("body", data.body ?? null)
      .input("created_at", new Date()).query(`
      INSERT INTO agilidade_contracts_repository (
        lead_id,
        colaborador,
        marca,
        status,
        telefone,
        email,
        data_assinatura,
        periodicidade,
        valor_ativacao,
        mensalidade,
        num_beneficiarios,
        send_status,
        error_type,
        error_message,
        http_status,
        body,
        created_at
      )
      VALUES (
        @lead_id,
        @colaborador,
        @marca,
        @status,
        @telefone,
        @email,
        @data_assinatura,
        @periodicidade,
        @valor_ativacao,
        @mensalidade,
        @num_beneficiarios,
        @send_status,
        @error_type,
        @error_message,
        @http_status,
        @body,
        @created_at
      )
    `);
  }
}
