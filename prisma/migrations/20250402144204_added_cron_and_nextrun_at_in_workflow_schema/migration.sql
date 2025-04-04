-- AlterTable
ALTER TABLE "workflow" ADD COLUMN "cron" TEXT;
ALTER TABLE "workflow" ADD COLUMN "nextRunAt" DATETIME;
