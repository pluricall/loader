/*
  Warnings:

  - You are about to drop the column `id_client` on the `bds` table. All the data in the column will be lost.
  - Added the required column `client_id_sql` to the `bds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bds" DROP COLUMN "id_client",
ADD COLUMN     "client_id_sql" INTEGER NOT NULL;
