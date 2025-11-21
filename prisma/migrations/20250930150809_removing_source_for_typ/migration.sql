/*
  Warnings:

  - You are about to drop the column `typ_id` on the `sources` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sources" DROP CONSTRAINT "sources_typ_id_fkey";

-- AlterTable
ALTER TABLE "sources" DROP COLUMN "typ_id";
