-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "lossReason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN';
