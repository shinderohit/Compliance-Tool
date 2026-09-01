const prisma = require("../../config/prisma");
const logAudit = require("../../utils/auditLogger");

const getCurrentCompany = async (userId) => {
    return prisma.company.findUnique({
        where: { userId },
    });
};

const createApprovalNotification = async ({
    companyId,
    title,
    message,
    data,
}) => {
    return prisma.notification.create({
        data: {
            companyId,
            type: "approval",
            title,
            message,
            data: data || {},
        },
    });
};

const getApprovalQueue = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const approvals = await prisma.complianceMaster.findMany({
            where: {
                companyId: company.id,
                approvalStatus: {
                    in: ["PENDING_APPROVAL", "APPROVED", "REJECTED"],
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return res.json({
            success: true,
            approvals,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch approval queue",
        });
    }
};

const submitComplianceForApproval = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const compliance = await prisma.complianceMaster.findFirst({
            where: {
                id: req.params.id,
                companyId: company.id,
            },
        });

        if (!compliance) {
            return res.status(404).json({
                success: false,
                message: "Compliance record not found",
            });
        }

        const updated = await prisma.complianceMaster.update({
            where: { id: compliance.id },
            data: {
                approvalStatus: "PENDING_APPROVAL",
                rejectionReason: null,
            },
        });

        await createApprovalNotification({
            companyId: company.id,
            title: "Compliance submitted for approval",
            message: `${updated.compliance || updated.complianceType || "Compliance"} is waiting for approval.`,
            data: { complianceId: updated.id },
        });

        await logAudit({
            req,
            action: "SUBMIT_FOR_APPROVAL",
            entityType: "ComplianceMaster",
            entityId: updated.id,
            companyId: company.id,
            changes: {
                before: compliance.approvalStatus || "DRAFT",
                after: "PENDING_APPROVAL",
            },
        });

        return res.json({
            success: true,
            compliance: updated,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit compliance for approval",
        });
    }
};

const approveCompliance = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const compliance = await prisma.complianceMaster.findFirst({
            where: {
                id: req.params.id,
                companyId: company.id,
            },
        });

        if (!compliance) {
            return res.status(404).json({
                success: false,
                message: "Compliance record not found",
            });
        }

        const updated = await prisma.complianceMaster.update({
            where: { id: compliance.id },
            data: {
                approvalStatus: "APPROVED",
                approvedAt: new Date(),
                approvedBy: req.user.email || req.user.id,
                rejectionReason: null,
                status:
                    compliance.status === "Pending Approval"
                        ? "Complied"
                        : compliance.status,
            },
        });

        await createApprovalNotification({
            companyId: company.id,
            title: "Compliance approved",
            message: `${updated.compliance || updated.complianceType || "Compliance"} was approved.`,
            data: { complianceId: updated.id },
        });

        await logAudit({
            req,
            action: "APPROVE",
            entityType: "ComplianceMaster",
            entityId: updated.id,
            companyId: company.id,
            changes: {
                before: compliance.approvalStatus || "DRAFT",
                after: "APPROVED",
            },
        });

        return res.json({
            success: true,
            compliance: updated,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve compliance",
        });
    }
};

const rejectCompliance = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);
        const { reason = "" } = req.body;

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const compliance = await prisma.complianceMaster.findFirst({
            where: {
                id: req.params.id,
                companyId: company.id,
            },
        });

        if (!compliance) {
            return res.status(404).json({
                success: false,
                message: "Compliance record not found",
            });
        }

        const updated = await prisma.complianceMaster.update({
            where: { id: compliance.id },
            data: {
                approvalStatus: "REJECTED",
                approvedAt: null,
                approvedBy: null,
                rejectionReason: reason || "Rejected without reason",
                status: "Rejected",
            },
        });

        await createApprovalNotification({
            companyId: company.id,
            title: "Compliance rejected",
            message: `${updated.compliance || updated.complianceType || "Compliance"} was rejected.`,
            data: { complianceId: updated.id, reason: updated.rejectionReason },
        });

        await logAudit({
            req,
            action: "REJECT",
            entityType: "ComplianceMaster",
            entityId: updated.id,
            companyId: company.id,
            reason: updated.rejectionReason,
            changes: {
                before: compliance.approvalStatus || "DRAFT",
                after: "REJECTED",
            },
        });

        return res.json({
            success: true,
            compliance: updated,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject compliance",
        });
    }
};

module.exports = {
    getApprovalQueue,
    submitComplianceForApproval,
    approveCompliance,
    rejectCompliance,
};
