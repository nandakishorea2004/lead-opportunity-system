-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "convertedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "productOrService" TEXT NOT NULL,
    "dealAmount" DECIMAL(12,2) NOT NULL,
    "expectedMarginPercent" DECIMAL(5,2) NOT NULL,
    "expectedMarginAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_leadId_key" ON "Opportunity"("leadId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
