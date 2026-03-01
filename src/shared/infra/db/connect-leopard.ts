import sql from "mssql";
import { env } from "../../../env";

const leopardPools: Map<string, sql.ConnectionPool> = new Map();

export async function connectLeopardDb(
  databaseName: string,
): Promise<sql.ConnectionPool> {
  const existing = leopardPools.get(databaseName);
  if (existing && existing.connected) return existing;

  const sqlConfig = {
    user: env.LEOPARD_USER!,
    password: env.LEOPARD_PASSWORD!,
    server: env.LEOPARD_SERVER!,
    port: env.LEOPARD_PORT ?? 1433,
    database: databaseName,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    leopardPools.set(databaseName, pool);
    return pool;
  } catch (err) {
    console.error("❌ Erro ao conectar no LEOPARD DB:", err);
    throw err;
  }
}
