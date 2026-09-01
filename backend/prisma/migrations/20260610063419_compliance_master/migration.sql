/*
  Warnings:

  - You are about to drop the column `companyName` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `complianceName` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `complianceScore` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `complianceType` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `riskLevel` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ComplianceMaster` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ComplianceMaster" DROP COLUMN "companyName",
DROP COLUMN "complianceName",
DROP COLUMN "complianceScore",
DROP COLUMN "complianceType",
DROP COLUMN "gstNumber",
DROP COLUMN "panNumber",
DROP COLUMN "riskLevel",
DROP COLUMN "updatedAt",
ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "compliance" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "frequency" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "risk" TEXT,
ALTER COLUMN "uin" SET DATA TYPE TEXT;
