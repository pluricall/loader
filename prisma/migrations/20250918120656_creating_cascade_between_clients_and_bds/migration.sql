-- DropForeignKey
ALTER TABLE "bds" DROP CONSTRAINT "bds_client_id_fkey";

-- AddForeignKey
ALTER TABLE "bds" ADD CONSTRAINT "bds_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
