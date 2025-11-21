import sql from "mssql";

const leopardPools: Map<string, sql.ConnectionPool> = new Map();

export async function connectLeopardDb(
  databaseName: string,
): Promise<sql.ConnectionPool> {
  const existing = leopardPools.get(databaseName);
  if (existing && existing.connected) return existing;

  const sqlConfig = {
    user: process.env.LEOPARD_USER!,
    password: process.env.LEOPARD_PASSWORD!,
    server: process.env.LEOPARD_SERVER!,
    port: parseInt(process.env.LEOPARD_PORT ?? "1433"),
    database: databaseName,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    console.log(`✅ Conectado ao LEOPARD DB (${databaseName})`);
    leopardPools.set(databaseName, pool);
    return pool;
  } catch (err) {
    console.error("❌ Erro ao conectar no LEOPARD DB:", err);
    throw err;
  }
}
