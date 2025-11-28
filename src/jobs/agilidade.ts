/* import cron from "node-cron";
import { processLeadsAgilidade } from "../modules/leads/AgilidadeServices";
import { FastifyInstance } from "fastify";

export async function agilidadeLeadsJob(fastify: FastifyInstance) {
  cron.schedule("* * * * *", async () => {
    fastify.log.info("⏰ Cron job disparado para processar leads...");
    try {
      await processLeadsAgilidade(fastify);
    } catch (err: any) {
      fastify.log.error(`Erro ao rodar o cron job: ${err.message}`);
    }
  });
  fastify.log.info("🚀 Cron job agendado para rodar a cada minuto.");
}
*/
