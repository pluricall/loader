/*
  Warnings:

  - Added the required column `end_time` to the `SourceBD` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SourceBD" ADD COLUMN     "end_time" TEXT NOT NULL;
