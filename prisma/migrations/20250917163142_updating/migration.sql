/*
  Warnings:

  - You are about to drop the column `name_bd` on the `bds` table. All the data in the column will be lost.
  - Added the required column `bd_name` to the `bds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bds" DROP COLUMN "name_bd",
ADD COLUMN     "bd_name" TEXT NOT NULL;
