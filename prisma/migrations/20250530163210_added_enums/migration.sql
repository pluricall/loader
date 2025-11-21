/*
  Warnings:

  - You are about to drop the column `estados` on the `bds` table. All the data in the column will be lost.
  - Added the required column `estado` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_client` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo_bd` on the `bds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoBD" AS ENUM ('EXTERNA', 'INTERNA');

-- CreateEnum
CREATE TYPE "EstadoBD" AS ENUM ('ACTIVO', 'INACTIVO');

-- AlterTable
ALTER TABLE "bds" DROP COLUMN "estados",
ADD COLUMN     "estado" "EstadoBD" NOT NULL,
ADD COLUMN     "id_client" INTEGER NOT NULL,
DROP COLUMN "tipo_bd",
ADD COLUMN     "tipo_bd" "TipoBD" NOT NULL,
ALTER COLUMN "origem" DROP NOT NULL;
