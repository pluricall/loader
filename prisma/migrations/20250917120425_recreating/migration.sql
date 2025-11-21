/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `cod_bd` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `dt_entrada` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `dt_saida` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `origem` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `qt_registros` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_bd` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `user_saida` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `cliente` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `contacto_dpo` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `contacto_ex_dto` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `sources` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `sources` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `bds` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_bd` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `bds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pathFtp` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BdType" AS ENUM ('EXTERNAL', 'INTERNAL');

-- CreateEnum
CREATE TYPE "BdStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- DropForeignKey
ALTER TABLE "bds" DROP CONSTRAINT "bds_cliente_id_fkey";

-- DropIndex
DROP INDEX "bds_cod_bd_key";

-- AlterTable
ALTER TABLE "bds" DROP COLUMN "cliente_id",
DROP COLUMN "cod_bd",
DROP COLUMN "comments",
DROP COLUMN "created_by",
DROP COLUMN "dt_entrada",
DROP COLUMN "dt_saida",
DROP COLUMN "estado",
DROP COLUMN "origem",
DROP COLUMN "qt_registros",
DROP COLUMN "tipo_bd",
DROP COLUMN "title",
DROP COLUMN "updated_at",
DROP COLUMN "updated_by",
DROP COLUMN "user_saida",
ADD COLUMN     "client_id" TEXT NOT NULL,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name_bd" TEXT NOT NULL,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "status" "BdStatus" NOT NULL,
ADD COLUMN     "type" "BdType" NOT NULL,
ADD COLUMN     "user" TEXT;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "cliente",
DROP COLUMN "contacto_dpo",
DROP COLUMN "contacto_ex_dto",
DROP COLUMN "estado",
ADD COLUMN     "client" TEXT NOT NULL,
ADD COLUMN     "contact_dpo" TEXT,
ADD COLUMN     "contact_ex_dto" TEXT,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD COLUMN     "pathFtp" TEXT NOT NULL,
ADD COLUMN     "recording_devolution" "Frequency",
ADD COLUMN     "status" "BdStatus" NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "sources" DROP COLUMN "created_by",
DROP COLUMN "updated_by",
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropEnum
DROP TYPE "EstadoBD";

-- DropEnum
DROP TYPE "TipoBD";

-- CreateIndex
CREATE UNIQUE INDEX "bds_code_key" ON "bds"("code");

-- AddForeignKey
ALTER TABLE "bds" ADD CONSTRAINT "bds_id_fkey" FOREIGN KEY ("id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
