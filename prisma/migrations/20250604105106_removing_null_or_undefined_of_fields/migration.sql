/*
  Warnings:

  - Made the column `comments` on table `bds` required. This step will fail if there are existing NULL values in that column.
  - Made the column `origem` on table `bds` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "bds" ALTER COLUMN "comments" SET NOT NULL,
ALTER COLUMN "origem" SET NOT NULL;
