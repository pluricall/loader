import { connectPluricallDb } from "../../../../shared/infra/db/connect-pluricall";
import {
  CreateReportParams,
  UpdateReportStatusParams,
  Report,
  ReportsRepository,
} from "../relatorios.repository";

export class MssqlReportsRepository implements ReportsRepository {
  async create(data: CreateReportParams): Promise<void> {
    const pool = await connectPluricallDb("onprem");

    await pool
      .request()
      .input("clientName", data.clientName)
      .input("siteId", data.siteId)
      .input("driveId", data.driveId)
      .input("folderPath", data.folderPath ?? "")
      .input("status", data.status).query(`
        INSERT INTO relatorios
          (client_name, site_id, drive_id, folder_path, status)
        VALUES
          (@clientName, @siteId, @driveId, @folderPath, @status)
      `);
  }

  async findAll(): Promise<Report[]> {
    const pool = await connectPluricallDb("onprem");

    const result = await pool.request().query(`
      SELECT * FROM relatorios
      ORDER BY created_at DESC
    `);

    return result.recordset;
  }

  async findByName(clientName: string): Promise<Report | null> {
    const pool = await connectPluricallDb("onprem");

    const result = await pool.request().input("clientName", clientName).query(`
        SELECT * FROM relatorios
        WHERE client_name = @clientName
      `);

    return result.recordset[0] ?? null;
  }

  async deactivateClient(clientName: string): Promise<void> {
    const pool = await connectPluricallDb("onprem");

    await pool.request().input("clientName", clientName).query(`
      UPDATE relatorios
      SET status = 'INACTIVO'
      WHERE client_name = @clientName;
    `);
  }

  async updateStatus(data: UpdateReportStatusParams): Promise<void> {
    const pool = await connectPluricallDb("onprem");

    await pool
      .request()
      .input("id", data.id)
      .input("lastStatus", data.lastStatus)
      .input("error", data.error ?? null).query(`
        UPDATE relatorios
        SET
          last_status = @lastStatus,
          last_send   = GETDATE(),
          error       = @error,
          updated_at  = GETDATE()
        WHERE id = @id
      `);
  }
}
