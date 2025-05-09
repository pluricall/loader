-- DropForeignKey
ALTER TABLE "SourceBD" DROP CONSTRAINT "SourceBD_campaign_id_fkey";

-- AddForeignKey
ALTER TABLE "SourceBD" ADD CONSTRAINT "SourceBD_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
