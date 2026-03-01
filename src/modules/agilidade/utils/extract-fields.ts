export function extractAllFields(jsonString: string): Record<string, any> {
  const fields = [
    "lead_id",
    "nome",
    "telefone",
    "email",
    "localidade",
    "created_date",
    "ad_id",
    "adset_id",
    "campaign_id",
    "ad_name",
    "campaign_name",
    "adset_name",
    "form_id",
    "dataEntrada",
    "dataPedido",
    "marca",
    "horario",
    "dist_id",
    "posted_date",
    "city",
  ];

  const result: Record<string, any> = {};

  for (const field of fields) {
    // Tenta diferentes padrões de regex
    const patterns = [
      new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`),
      new RegExp(`${field}\\\\?"\\s*:\\s*\\\\?"([^\\\\"]+)`),
      new RegExp(`"${field}"\\s*:\\s*"([^"\\\\]+)`),
    ];

    for (const pattern of patterns) {
      const match = jsonString.match(pattern);
      if (match && match[1]) {
        result[field] = match[1].replace(/\\"/g, '"').trim();
        break;
      }
    }
  }

  return result;
}
