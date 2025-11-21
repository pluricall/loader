export class MssqlUpdateError extends Error {
  constructor(message: string = "Falha ao atualizar no banco de dados.") {
    super(message);
    this.name = "MssqlUpdateError";
  }
}
