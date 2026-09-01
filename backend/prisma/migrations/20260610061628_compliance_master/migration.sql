-- CreateTable
CREATE TABLE "ComplianceMaster" (
    "id" TEXT NOT NULL,
    "uin" INTEGER,
    "state" TEXT,
    "location" TEXT,
    "lawArea" TEXT,
    "actRule" TEXT,
    "complianceName" TEXT,
    "status" TEXT,
    "dueDate" TIMESTAMP(3),
    "riskLevel" TEXT,
    "remarks" TEXT,
    "companyName" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "complianceType" TEXT,
    "complianceScore" INTEGER,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceMaster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComplianceMaster" ADD CONSTRAINT "ComplianceMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
