/*
  Warnings:

  - You are about to drop the column `pathFtp` on the `clients` table. All the data in the column will be lost.
  - Added the required column `ftp_path` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "pathFtp",
ADD COLUMN     "ftp_path" TEXT NOT NULL;
