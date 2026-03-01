import sql from "mssql";
import { connectPluricallDb } from "../infra/db/pluricall-db";

export async function saveLinceRequest(data: any) {
  const pool = await connectPluricallDb("onprem");

  await pool
    .request()
    .input("method", sql.VarChar(10), data.method)
    .input("endpoint", sql.NVarChar(sql.MAX), data.endpoint)
    .input("query", sql.NVarChar(sql.MAX), data.query)
    .input("headers", sql.NVarChar(sql.MAX), data.headers)
    .input("body", sql.NVarChar(sql.MAX), data.body)
    .input("raw", sql.NVarChar(sql.MAX), data.raw)
    .input("ctype", sql.VarChar(255), data.ctype)
    .input("auth", sql.NVarChar(sql.MAX), data.auth)
    .input("ip", sql.VarChar(100), data.ip)
    .input("ua", sql.NVarChar(sql.MAX), data.ua).query(`
      INSERT INTO lince_received
      (method, endpoint, query_string, headers, body, raw_body,
       contentType, auth, source_ip, user_agent)
      VALUES
      (@method, @endpoint, @query, @headers, @body, @raw,
       @ctype, @auth, @ip, @ua)
    `);
}
