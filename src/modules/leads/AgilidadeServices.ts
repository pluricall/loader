/* import { FastifyInstance } from "fastify";
import { AltitudeService } from "../altitude/AltitudeService";
import { sendEmail } from "../../config/send-email";

const fieldMapping = {
  ACTIVITY_HOME_PHONE_VALUE: "HomePhone",
  ACTIVITY_MOBILE_PHONE_VALUE: "MobilePhone",
  ACTIVITY_FIRST: "FirstName",
  "-localidade": "localidade",
  "-bd_ad_id": "bd_ad_id",
  "-bd_id": "bd_id",
  "-bd_adset_id": "bd_adset_id",
  "-bd_campaign_id": "bd_campaign_id",
  "-bd_created_time": "bd_created_time",
  "-bd_ad_name": "bd_ad_name",
  "-bd_campaign_name": "bd_campaign_name",
  "-cod_campanha": "cod_campanha",
  "-bd_adset_name": "bd_adset_name",
  "-enderecoemail": "enderecoemail",
  "-bd_form_id": "bd_form_id",
  "-plc_id": "plc_id",
  "-dataload": "dataload",
};

export async function processLeadsAgilidade(fastify: FastifyInstance) {
  fastify.log.level = "debug";
  const logger = fastify.log;
  const pool = fastify.mssql;

  async function updateLeadStatus(
    databaseName: string,
    id: number,
    status: string,
  ) {
    await pool
      .request()
      .input("status", status)
      .input("id", id)
      .query(`UPDATE ${databaseName} SET lead_status = @status WHERE id = @id`);
  }

  async function getLeadsWithStatus(databaseName: string, status: string) {
    const lockFlag = `LOCKED_${new Date().toISOString()}_${Math.random()}`;

    await pool.request().input("status", status).input("lockFlag", lockFlag)
      .query(`
    UPDATE ${databaseName} 
    SET lead_status = @lockFlag
    WHERE lead_status = @status
  `);

    const result = await pool
      .request()
      .input("lockFlag", lockFlag)
      .query(`SELECT * FROM  ${databaseName} WHERE lead_status = @lockFlag`);

    return result.recordset;
  }

  try {
    const leads = await getLeadsWithStatus(
      "agilidade_leads_repository",
      "NEWX",
    );

    if (leads.length === 0) {
      logger.info("ℹ️ Nenhum lead novo encontrado. Encerrando processo.");
      return { status: "no-leads", totalProcessed: 0 };
    }

    for (const lead of leads) {
      const {
        id: table_id,
        timestamp,
        gen_id,
        campanha_easy,
        contact_list_easy,
        phone_number,
        nome,
        email,
        lead_id,
        created_date,
        city,
        ad_id,
        adset_id,
        campaign_id,
        ad_name,
        campaign_name,
        adset_name,
        form_id,
      } = lead;

      if (!phone_number) {
        await pool
          .request()
          .query(
            `UPDATE agilidade_leads_repository SET lead_status = 'ERRO' WHERE id = ${table_id}`,
          );
        continue;
      }

      const mobile_phone = phone_number.startsWith("9") ? phone_number : "";
      const home_phone = !phone_number.startsWith("9") ? phone_number : "";
      const id_cliente = lead_id || gen_id;
      const dataload = timestamp ? timestamp.toISOString().split("T")[0] : "";
      const plc_id = gen_id;

      const attributes = Object.entries(fieldMapping).map(
        ([typField, apiField]) => {
          let value = "";

          switch (typField) {
            case "ACTIVITY_HOME_PHONE_VALUE":
              value = home_phone;
              break;
            case "ACTIVITY_MOBILE_PHONE_VALUE":
              value = mobile_phone;
              break;
            case "ACTIVITY_FIRST":
              value = nome;
              break;
            case "-localidade":
              value = city;
              break;
            case "-bd_ad_id":
              value = ad_id;
              break;
            case "-bd_id":
              value = id_cliente;
              break;
            case "-bd_adset_id":
              value = adset_id;
              break;
            case "-bd_campaign_id":
              value = campaign_id;
              break;
            case "-bd_created_time":
              value = created_date || "";
              break;
            case "-bd_ad_name":
              value = ad_name;
              break;
            case "-bd_campaign_name":
              value = campaign_name;
              break;
            case "-cod_campanha":
              value = campanha_easy;
              break;
            case "-bd_adset_name":
              value = adset_name;
              break;
            case "-enderecoemail":
              value = email;
              break;
            case "-bd_form_id":
              value = form_id;
              break;
            case "-plc_id":
              value = plc_id;
              break;
            case "-dataload":
              value = dataload;
              break;
          }

          return { Name: apiField, Value: value };
        },
      );

      try {
        const altitudeService = new AltitudeService();
        const creatingContactResponse = await altitudeService.createContact({
          discriminator: "",
          campaignName: campanha_easy,
          contactCreateRequest: {
            Status: "Created",
            discriminator: "",
            DirectoryName: { Value: "agilidade_leads_2025" },
            Attributes: attributes,
            ContactListName: { Value: contact_list_easy },
            TimeZoneName: { Value: "GMT" },
          },
        });

        if (
          creatingContactResponse.status === 200 &&
          creatingContactResponse.data
        ) {
          logger.info(
            `✅ Lead criado com sucesso. ID: ${creatingContactResponse.data}`,
          );
          await updateLeadStatus(
            "agilidade_leads_repository",
            table_id,
            "EASYLOAD",
          );
        } else {
          throw new Error(
            `Falha ao criar contato. Status: ${creatingContactResponse.status}`,
          );
        }
      } catch (error: any) {
        await updateLeadStatus("agilidade_leads_repository", table_id, "ERRO");
        await sendEmail({
          campaignName: "agilidade_leads",
          title: "❌ Erro ao processar lead",
          errors: `Erro no lead ${gen_id}: ${error.message}`,
        });
      }
    }
    return {
      loadedContacts: leads.length,
    };
  } catch (err: any) {
    logger.error(`💥 Erro geral durante o processamento: ${err.message}`);
    throw err;
  }
}
*/
