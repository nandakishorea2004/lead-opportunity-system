-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "personName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "nextStep" TEXT NOT NULL DEFAULT 'Call Tomorrow',
    "warmth" TEXT NOT NULL DEFAULT 'Curious',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
