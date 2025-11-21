/*
  Warnings:

  - Added the required column `estado` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "estado" "EstadoBD" NOT NULL;
