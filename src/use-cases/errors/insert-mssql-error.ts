export class MssqlInsertError extends Error {
  constructor(message: string = "Falha ao inserir no banco de dados MSSQL.") {
    super(message);
    this.name = "MssqlInsertError";
  }
}
