/*
  Warnings:

  - Changed the type of `client_id` on the `clients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "client_id",
ADD COLUMN     "client_id" INTEGER NOT NULL;
