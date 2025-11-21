/*
  Warnings:

  - You are about to drop the `BD` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BD" DROP CONSTRAINT "BD_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "BD" DROP CONSTRAINT "BD_sourceId_fkey";

-- DropTable
DROP TABLE "BD";

-- CreateTable
CREATE TABLE "bds" (
    "id" TEXT NOT NULL,
    "cod_bd" TEXT NOT NULL,
    "tipo_bd" TEXT NOT NULL,
    "dt_entrada" TIMESTAMP(3) NOT NULL,
    "dt_saida" TIMESTAMP(3),
    "user_saida" TEXT,
    "qt_registros" INTEGER,
    "estados" TEXT,
    "comments" TEXT,
    "origem" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "bds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bds_cod_bd_key" ON "bds"("cod_bd");

-- AddForeignKey
ALTER TABLE "bds" ADD CONSTRAINT "bds_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bds" ADD CONSTRAINT "bds_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
