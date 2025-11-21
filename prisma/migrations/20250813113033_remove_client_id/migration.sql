/*
  Warnings:

  - You are about to drop the column `client_id` on the `clients` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "clients_client_id_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "client_id";
