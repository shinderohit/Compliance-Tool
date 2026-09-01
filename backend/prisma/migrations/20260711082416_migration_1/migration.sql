/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ComplianceMaster` table. All the data in the column will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ComplianceMaster" DROP COLUMN "approvalStatus",
DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "rejectionReason",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "audit_logs";

-- CreateIndex
CREATE INDEX "approval_flows_complianceItemId_idx" ON "approval_flows"("complianceItemId");

-- CreateIndex
CREATE INDEX "attachments_complianceItemId_idx" ON "attachments"("complianceItemId");

-- CreateIndex
CREATE INDEX "audit_trails_complianceItemId_idx" ON "audit_trails"("complianceItemId");

-- CreateIndex
CREATE INDEX "audit_trails_action_idx" ON "audit_trails"("action");

-- CreateIndex
CREATE INDEX "holidays_calendarId_idx" ON "holidays"("calendarId");
