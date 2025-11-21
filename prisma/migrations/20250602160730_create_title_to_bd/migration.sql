/*
  Warnings:

  - A unique constraint covering the columns `[client_id]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `bds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bds" ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_client_id_key" ON "clients"("client_id");
