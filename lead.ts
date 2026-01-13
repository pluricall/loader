import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import axios from "axios";

const EXCEL_FILE = path.join(__dirname, "leads", "leads.xlsx");

const PHP_ENDPOINT =
  "https://lince.centrocontacto.cc/formsendpoint/minisom/facebook/";

async function sendLead(lead: any) {
  try {
    lead.form_id = String(lead.form_id).replace(/^'/, "");

    const payload = {
      form_id: lead.form_id,
      lead_id: lead.lead_id,
      full_name: lead.full_name,
      email: lead.email,
      phone_number: lead.phone_number,
    };

    const params = new URLSearchParams(payload);

    const response = await axios.post(PHP_ENDPOINT, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log(`Lead ${lead.full_name} -> ${response.data}`);
  } catch (error: any) {
    console.error(`Erro ao enviar lead ${lead.full_name}:`, error.message);
  }
}

async function main() {
  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`Arquivo Excel não encontrado em ${EXCEL_FILE}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const leads = XLSX.utils.sheet_to_json(sheet);

  console.log(`Encontradas ${leads.length} leads no Excel.`);

  for (const lead of leads) {
    await sendLead(lead);
  }

  console.log("Processamento finalizado.");
}

main();
