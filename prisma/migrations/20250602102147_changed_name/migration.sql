/*
  Warnings:

  - You are about to drop the column `client_id_sql` on the `bds` table. All the data in the column will be lost.
  - Added the required column `client_id_from_plc_clientes` to the `bds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bds" DROP COLUMN "client_id_sql",
ADD COLUMN     "client_id_from_plc_clientes" INTEGER NOT NULL;
