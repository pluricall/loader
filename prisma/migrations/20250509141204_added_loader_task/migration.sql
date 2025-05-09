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
