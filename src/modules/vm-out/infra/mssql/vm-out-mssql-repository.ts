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
    const pool = await connectPluricallDb("onprem");

    const result = await pool.request().query(`
    SELECT telefone2_
    FROM vm_out_all
    WHERE CAST(dataload AS DATE) = CAST(GETDATE() AS DATE)
  `);

    return result.recordset.map((r: any) => r.telefone2_);
  }

  async save(data: SaveVMOutData) {
    const pool = await connectPluricallDb("cloud");

    await pool
      .request()
      .input("execution_id", data.executionId)
      .input("gen_id", data.genId)
      .input("campanha", data.campanha)
      .input("contact_list", data.contactList)
      .input("raw_phone", data.rawPhone)
      .input("phone", data.phone)
      .input("calls", data.calls)
      .input("last_call", data.lastCall)
      .input("status", data.status)
      .input("reason", data.reason || null).query(`
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
      VALUES (
        @execution_id,
        @gen_id,
        @campanha,
        @contact_list,
        @raw_phone,
        @phone,
        @calls,
        @last_call,
        @status,
        @reason
      )
    `);
  }

  async updateStatus(
    genId: string,
    status: string,
    error?: string,
    response?: string,
  ) {
    const pool = await connectPluricallDb("cloud");

    await pool
      .request()
      .input("gen_id", genId)
      .input("status", status)
      .input("error", error || null)
      .input("response", response || null).query(`
      UPDATE vm_out_repository
      SET 
        status = @status,
        error = @error,
        altitude_response = @response,
        updated_at = GETDATE()
      WHERE gen_id = @gen_id
    `);
  }
}
