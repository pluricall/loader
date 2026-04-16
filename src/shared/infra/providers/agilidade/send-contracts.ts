import { SendContractsPayload } from "../../../../modules/agilidade/http/schemas/agilidade-contracts.schema";

export class AgilidadeSendContractsService {
  private readonly BASE_URL = "https://agilidade-app.herokuapp.com";

  async sendSubscription(payload: SendContractsPayload) {
    const response = await fetch(`${this.BASE_URL}/contracts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Agilidade API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
