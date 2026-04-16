interface AgilidadeSendRecordingsParams {
  Id: string;
  TipoChamada: string;
  DataHora: string;
  Telefone: string;
  AtendidaPor: string;
  Duracao: string;
  Gravacao: any;
}

export class AgilidadeSendRecordingsService {
  private readonly BASE_URL = "https://agilidade-app.herokuapp.com";

  async sendRecordings({
    Id,
    TipoChamada,
    DataHora,
    Telefone,
    AtendidaPor,
    Duracao,
    Gravacao,
  }: AgilidadeSendRecordingsParams) {
    const response = await fetch(`${this.BASE_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Id,
        TipoChamada,
        DataHora,
        Telefone,
        AtendidaPor,
        Duracao,
        Gravacao,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Agilidade API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
