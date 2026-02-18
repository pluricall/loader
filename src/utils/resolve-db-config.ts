import { env } from "../env";

export type ClientEnvironment = "cloud" | "onprem";

export interface DbResolvedConfig {
  user: string;
  password: string;
  server: string;
  port: number;
  database: string;
}

export function resolveDbConfig(
  environment: ClientEnvironment,
): DbResolvedConfig {
  if (env.NODE_ENV === "pre") {
    return {
      user: env.PLURICALL_PRE_DB_USER,
      password: env.PLURICALL_PRE_DB_PASSWORD,
      server: env.PLURICALL_PRE_DB_SERVER,
      port: env.PLURICALL_PRE_DB_PORT,
      database: env.PLURICALL_PRE_DB_DATABASE,
    };
  }

  // 🌩 Cloud
  if (environment === "cloud") {
    return {
      user: env.PLURICALL_CLOUD_DB_USER,
      password: env.PLURICALL_CLOUD_DB_PASSWORD,
      server: env.PLURICALL_CLOUD_DB_SERVER,
      port: env.PLURICALL_CLOUD_DB_PORT,
      database: env.PLURICALL_CLOUD_DB_DATABASE,
    };
  }

  // 🏢 OnPrem
  return {
    user: env.PLURICALL_ONPREM_DB_USER,
    password: env.PLURICALL_ONPREM_DB_PASSWORD,
    server: env.PLURICALL_ONPREM_DB_SERVER,
    port: env.PLURICALL_ONPREM_DB_PORT,
    database: env.PLURICALL_ONPREM_DB_DATABASE,
  };
}
