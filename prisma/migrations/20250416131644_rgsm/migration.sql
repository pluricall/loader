-- CreateEnum
CREATE TYPE "TypeBbEnum" AS ENUM ('BLENDED', 'OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "EntityNameEnum" AS ENUM ('ACTIVITY', 'CONTACT_PROFILE', 'CONSENT', 'DNCL_ENTRY', 'TABLE_SCHEMA_ENUM_VALUE', 'WF_PROCESS_INSTANCE');

-- CreateEnum
CREATE TYPE "LoadingModeEnum" AS ENUM ('APPEND', 'UPDATE', 'APPEND_OR_UPDATE', 'REPLACE');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "dataload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign_type" "TypeBbEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceBD" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "local_path" TEXT,
    "host" TEXT,
    "password" TEXT,
    "username" TEXT,
    "port" INTEGER,
    "full_url" TEXT,
    "frequency" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "interval" INTEGER NOT NULL,
    "day_of_week" INTEGER[],
    "day_of_month" INTEGER[],
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign_id" TEXT NOT NULL,
    "typ_id" TEXT,

    CONSTRAINT "SourceBD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypBD" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "separator" TEXT NOT NULL,
    "entityName" "EntityNameEnum" NOT NULL,
    "loadingMode" "LoadingModeEnum" NOT NULL,
    "parserMode" TEXT NOT NULL,
    "fields" TEXT[],
    "fixed_fields" JSONB NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypBD_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_name_key" ON "Campaign"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TypBD_name_key" ON "TypBD"("name");

-- AddForeignKey
ALTER TABLE "SourceBD" ADD CONSTRAINT "SourceBD_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceBD" ADD CONSTRAINT "SourceBD_typ_id_fkey" FOREIGN KEY ("typ_id") REFERENCES "TypBD"("id") ON DELETE SET NULL ON UPDATE CASCADE;
