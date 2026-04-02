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
WHERE CAST(dataload AS DATE) = CAST(GETDATE() AS DATE);
  `);
    return remoteResult.recordset.map((r: any) => r.telefone);
  }

  async saveBulk(data: SaveVMOutData[]) {
    if (!data.length) return;

    const pool = await connectPluricallDb("cloud");
    const request = pool.request();

    const values: string[] = [];

    data.forEach((d, i) => {
      request.input(`execution_id${i}`, d.executionId);
      request.input(`gen_id${i}`, d.genId);
      request.input(`campanha${i}`, d.campanha);
      request.input(`contact_list${i}`, d.contactList);
      request.input(`raw_phone${i}`, d.rawPhone);
      request.input(`phone${i}`, d.phone);
      request.input(`calls${i}`, d.calls);
      request.input(`last_call${i}`, d.lastCall);
      request.input(`status${i}`, d.status);
      request.input(`reason${i}`, d.reason || null);

      values.push(`(
      @execution_id${i},
      @gen_id${i},
      @campanha${i},
      @contact_list${i},
      @raw_phone${i},
      @phone${i},
      @calls${i},
      @last_call${i},
      @status${i},
      @reason${i}
    )`);
    });

    await request.query(`
    INSERT INTO vm_out_repository (
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
    VALUES ${values.join(",")}
  `);
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
        status = @status,
        error = @error,
        altitude_response = @response,
        updated_at = GETDATE()
      WHERE gen_id IN (${idsParams.join(",")})
    `);
  }
}
