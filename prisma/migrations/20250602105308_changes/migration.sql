/*
  Warnings:

  - A unique constraint covering the columns `[source_id]` on the table `bds` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bds_source_id_key" ON "bds"("source_id");
