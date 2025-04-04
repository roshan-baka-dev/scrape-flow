-- AlterTable
ALTER TABLE "workflow" ADD COLUMN "lastRunAt" DATETIME;
ALTER TABLE "workflow" ADD COLUMN "lastRunId" TEXT;
ALTER TABLE "workflow" ADD COLUMN "lastRunStatus" TEXT;
