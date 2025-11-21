/*
  Warnings:

  - You are about to drop the column `sourceId` on the `bds` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `sources` table. All the data in the column will be lost.
  - You are about to drop the column `entityName` on the `typs` table. All the data in the column will be lost.
  - You are about to drop the column `loadingMode` on the `typs` table. All the data in the column will be lost.
  - Added the required column `entity_name` to the `typs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loading_mode` to the `typs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bds" DROP CONSTRAINT "bds_sourceId_fkey";

-- AlterTable
ALTER TABLE "bds" DROP COLUMN "sourceId",
ADD COLUMN     "source_id" TEXT;

-- AlterTable
ALTER TABLE "sources" DROP COLUMN "client_id";

-- AlterTable
ALTER TABLE "typs" DROP COLUMN "entityName",
DROP COLUMN "loadingMode",
ADD COLUMN     "entity_name" "EntityNameEnum" NOT NULL,
ADD COLUMN     "loading_mode" "LoadingModeEnum" NOT NULL,
ALTER COLUMN "parserMode" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bds" ADD CONSTRAINT "bds_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
