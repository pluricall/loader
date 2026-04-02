import { connectPluricallDb } from "../../../../shared/infra/db/pluricall-db";
import {
  IVmOutRepository,
  SaveVMOutData,
} from "../../domain/repositories/vm-out.repository";

export class MssqlVmOutRepository implements IVmOutRepository {
  async getBlacklist(): Promise<string[]> {
    const pool = await connectPluricallDb("cloud");

    const result = await pool.request().query(`
      SELECT telefone FROM blacklist_vm_out
    `);

    return result.recordset.map((r: any) => r.telefone);
  }

  async getAttendedToday(): Promise<string[]> {
    const poolOnprem = await connectPluricallDb("onprem");

    const remoteResult = await poolOnprem.request().query(`
      SELECT DISTINCT
        RIGHT(REPLACE(REPLACE(COALESCE(telefone2_, telefone1_), '+351', ''), ' ', ''), 9) AS telefone
      FROM ct_vm_out_cloud
      WHERE CAST(dataload AS DATE) = CAST(GETDATE() AS DATE)
    `);

    return remoteResult.recordset.map((r: any) => r.telefone);
  }

  async saveBulk(data: SaveVMOutData[]) {
    if (!data.length) return;

    const pool = await connectPluricallDb("cloud");

    // Um INSERT por linha com MERGE para ignorar duplicados atomicamente.
    // O batch único anterior rebentava inteiro se um único registo já existisse.
    for (const d of data) {
      const request = pool.request();

      request.input("execution_id", d.executionId);
      request.input("gen_id", d.genId);
      request.input("campanha", d.campanha);
      request.input("contact_list", d.contactList);
      request.input("raw_phone", d.rawPhone);
      request.input("phone", d.phone);
      request.input("calls", d.calls);
      request.input("last_call", d.lastCall);
      request.input("status", d.status);
      request.input("reason", d.reason || null);

      await request.query(`
        MERGE vm_out_repository AS target
        USING (
          SELECT
            @execution_id AS execution_id,
            @gen_id       AS gen_id,
            @campanha     AS campanha,
            @contact_list AS contact_list,
            @raw_phone    AS raw_phone_number,
            @phone        AS phone_number,
            @calls        AS calls,
            @last_call    AS last_call,
            @status       AS status,
            @reason       AS reason
        ) AS source
        ON (
          target.phone_number = source.phone_number
          AND CAST(target.created_at AS DATE) = CAST(GETDATE() AS DATE)
        )
        WHEN NOT MATCHED THEN
          INSERT (
            execution_id,
            gen_id,
            campanha,
            contact_list,
            raw_phone_number,
            phone_number,
            calls,
            last_call,
            status,
            reason
          )
          VALUES (
            source.execution_id,
            source.gen_id,
            source.campanha,
            source.contact_list,
            source.raw_phone_number,
            source.phone_number,
            source.calls,
            source.last_call,
            source.status,
            source.reason
          );
      `);
    }
  }

  async updateStatusBulk(
    genIds: string[],
    status: string,
    error?: string,
    response?: string,
  ) {
    if (!genIds.length) return;

    const pool = await connectPluricallDb("cloud");
    const request = pool.request();

    const idsParams = genIds.map((id, index) => {
      const paramName = `id${index}`;
      request.input(paramName, id);
      return `@${paramName}`;
    });

    await request
      .input("status", status)
      .input("error", error || null)
      .input("response", response || null).query(`
        UPDATE vm_out_repository
        SET
          status       = @status,
          error        = @error,
          altitude_response = @response,
          updated_at   = GETDATE()
        WHERE gen_id IN (${idsParams.join(",")})
      `);
  }
}
