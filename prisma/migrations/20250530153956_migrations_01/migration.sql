-- CreateEnum
CREATE TYPE "EntityNameEnum" AS ENUM ('ACTIVITY', 'CONTACT_PROFILE', 'CONSENT', 'DNCL_ENTRY', 'TABLE_SCHEMA_ENUM_VALUE', 'WF_PROCESS_INSTANCE');

-- CreateEnum
CREATE TYPE "LoadingModeEnum" AS ENUM ('APPEND', 'UPDATE', 'APPEND_OR_UPDATE', 'REPLACE');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "contacto_dpo" TEXT,
    "contacto_ex_dto" TEXT,
    "info_ex_dto" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BD" (
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

    CONSTRAINT "BD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
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
    "end_time" TEXT NOT NULL,
    "interval" INTEGER NOT NULL,
    "day_of_week" INTEGER[],
    "day_of_month" INTEGER[],
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" TEXT NOT NULL,
    "typ_id" TEXT,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typs" (
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

    CONSTRAINT "typs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loaders_task" (
    "id" TEXT NOT NULL,
    "task_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "status_description" TEXT NOT NULL,
    "percentage_done" INTEGER NOT NULL,
    "creation_moment" TIMESTAMP(3) NOT NULL,
    "start_moment" TIMESTAMP(3) NOT NULL,
    "end_moment" TIMESTAMP(3) NOT NULL,
    "internal" TEXT,

    CONSTRAINT "loaders_task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BD_cod_bd_key" ON "BD"("cod_bd");

-- CreateIndex
CREATE UNIQUE INDEX "typs_name_key" ON "typs"("name");

-- AddForeignKey
ALTER TABLE "BD" ADD CONSTRAINT "BD_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BD" ADD CONSTRAINT "BD_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_typ_id_fkey" FOREIGN KEY ("typ_id") REFERENCES "typs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
