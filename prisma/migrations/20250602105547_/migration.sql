/*
  Warnings:

  - You are about to drop the column `source_id` on the `bds` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bd_id]` on the table `sources` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bd_id` to the `sources` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bds" DROP CONSTRAINT "bds_source_id_fkey";

-- DropIndex
DROP INDEX "bds_source_id_key";

-- AlterTable
ALTER TABLE "bds" DROP COLUMN "source_id";

-- AlterTable
ALTER TABLE "sources" ADD COLUMN     "bd_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sources_bd_id_key" ON "sources"("bd_id");

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_bd_id_fkey" FOREIGN KEY ("bd_id") REFERENCES "bds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
