const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const slugify = require("../../utils/slugify");
const logAudit = require("../../utils/auditLogger");
const companyService = require("./company.service");
const {
    getEffectiveRisk,
    getEffectiveStatus,
    startOfToday,
} = require("../compliance/compliance.metrics");

const { sendCompanyCreatedEmails } = require("../../utils/mailService");
const storageService = require("../../services/storage/storage.service");
const { generateSystemId, generateTemporaryPassword } = require("../../utils/systemIds");
const { resolveIndustryId } = require("../../utils/onboardingHelpers");

const createCompanyController = async (req, res) => {
    try {
        const {
            companyName,
            companyNameAsPerGstCertificate,
            name,
            email,
            seDetails,
            natureOfWork,
            industryId,
            appropriateGovernment,
            branchCode,
            state,
            city,
            location,
            pincode,
            panNumber,
            gstNumber,
            pfNumber,
            esicNumber,
            ptNumber,
            lwfNumber,
        } = req.body;

        const gstCertificateFile = req.files?.gstCertificate?.[0];
        const seCertificateFile = req.files?.seCertificate?.[0];
        const requiredFiles = ["panCertificate", "gstCertificate", "seCertificate", "pfCertificate", "esicCertificate", "ptCertificate", "lwfCertificate"];
        const missingFile = requiredFiles.find((field) => !req.files?.[field]?.[0]);

        if (
            !companyName ||
            !companyNameAsPerGstCertificate ||
            !name ||
            !email ||
            !seDetails ||
            !natureOfWork ||
            !industryId ||
            !appropriateGovernment ||
            missingFile
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields and document uploads are required",
            });
        }

        const client = await prisma.client.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        if (client.serviceModel !== "PAAS") {
            return res.status(403).json({
                success: false,
                message: "Company/branch onboarding is available only for PaaS clients",
            });
        }

        const slug = slugify(companyName);

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const existingCompany = await prisma.company.findUnique({
            where: {
                slug,
            },
        });

        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: "Company already exists",
            });
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        const gstCertificate = storageService.getFileMetadata(gstCertificateFile);
        const seCertificate = storageService.getFileMetadata(seCertificateFile);
        const fileData = {};
        [...requiredFiles, "bulkUpload"].forEach((field) => {
            const file = req.files?.[field]?.[0];
            if (file) fileData[field] = storageService.getFileMetadata(file);
        });

        const company = await prisma.$transaction(async (tx) => {
            const resolvedIndustryId = await resolveIndustryId(tx, industryId);
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    temporaryPassword,
                    role: "COMPANY",
                    isActive: false,
                },
            });

            return tx.company.create({
                data: {
                    companyCode: await generateSystemId(tx, "company", "CMP"),
                    branchCode,
                    name: companyName,
                    slug,
                    email,
                    userId: user.id,
                    clientId: client.id,
                    state,
                    city,
                    location,
                    pincode,
                    pan: panNumber,
                    gst: gstNumber,
                    pf: pfNumber,
                    esic: esicNumber,
                    pt: ptNumber,
                    lwf: lwfNumber,
                    companyNameAsPerGstCertificate,
                    gstCertificate,
                    seDetails,
                    seCertificate,
                    ...fileData,
                    natureOfWork,
                    industryId: resolvedIndustryId,
                    appropriateGovernment,
                },
            });
        });

        let mailResult = null;
        try {
            const kao = await prisma.kao.findUnique({
                where: {
                    id: client.kaoId,
                },
            });

            const loginUrl = `/company/${slug}/login`;
            mailResult = await sendCompanyCreatedEmails({
                company,
                kao,
                loginUrl,
                password: temporaryPassword,
            });
        } catch (mailError) {
            console.log(mailError);
            mailResult = {
                skipped: true,
                reason: mailError.message,
            };
        }

        await logAudit({
            req,
            action: "COMPANY_CREATED",
            entityType: "Company",
            entityId: company.id,
            companyId: company.id,
            changes: {
                name: company.name,
                email: company.email,
                clientId: client.id,
                industryId,
                appropriateGovernment,
                mail: mailResult?.skipped ? `Skipped: ${mailResult.reason}` : "Sent",
            },
            reason: "Client created company",
        });

        return res.status(201).json({
            success: true,
            company,
            loginUrl: `/company/${slug}/login`,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getCompanyDashboard = async (req, res) => {
    try {
        const branchId = req.query.branchId;
        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
            include: {
                uploads: {
                    where: branchId ? { branchId } : undefined,
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 10,
                },
                branches: true,
            },
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        if (branchId && !company.branches.some((branch) => branch.id === branchId)) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
            });
        }

        const averageScore =
            company.uploads.reduce(
                (sum, upload) => sum + (upload.complianceScore || 0),
                0
            ) / (company.uploads.length || 1);

        const aiSuggestions = company.uploads.reduce(
            (sum, upload) => sum + (upload.aiAnalysis?.issues?.length || 0),
            0
        );

        return res.status(200).json({
            success: true,
            company: {
                id: company.id,
                name: company.name,
                email: company.email,
                slug: company.slug,
                branches: company.branches,
                selectedBranchId: branchId || null,
            },
            stats: {
                totalUploads: company.uploads.length,
                complianceScore: Math.round(averageScore),
                aiSuggestions,
                riskLevel: company.uploads[0]?.riskLevel || "N/A",
            },
            uploads: company.uploads.map((upload) => ({
                id: upload.id,
                title: upload.title,
                fileUrl: upload.fileUrl,
                complianceScore: upload.complianceScore,
                riskLevel: upload.riskLevel,
                issues: upload.aiAnalysis?.issues || [],
                createdAt: upload.createdAt,
            })),
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getCurrentCompany = async (userId) => {
    return prisma.company.findUnique({
        where: {
            userId,
        },
    });
};

const getCompanyProfile = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const profile = await companyService.getCompanyProfile(company.id);

        return res.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch company profile",
        });
    }
};

const updateCompanyProfile = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const profile = await companyService.updateCompanyProfile(
            company.id,
            req.body,
        );

        await logAudit({
            req,
            action: "COMPANY_PROFILE_UPDATED",
            entityType: "Company",
            entityId: company.id,
            companyId: company.id,
            changes: req.body,
            reason: "Company updated profile",
        });

        return res.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update company profile",
        });
    }
};

const getDashboardWidgets = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const today = startOfToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const renewalCutoff = new Date(today);
        renewalCutoff.setDate(renewalCutoff.getDate() + 30);

        const [
            todayTasks,
            upcomingRenewals,
            recentUploads,
            complianceMasters,
            notifications,
            activities,
        ] = await Promise.all([
            prisma.complianceMaster.findMany({
                where: {
                    companyId: company.id,
                    dueDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                orderBy: {
                    dueDate: "asc",
                },
                take: 6,
            }),
            prisma.complianceMaster.findMany({
                where: {
                    companyId: company.id,
                    expiryDate: {
                        gte: today,
                        lte: renewalCutoff,
                    },
                },
                orderBy: {
                    expiryDate: "asc",
                },
                take: 6,
            }),
            prisma.complianceUpload.findMany({
                where: {
                    companyId: company.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 6,
            }),
            prisma.complianceMaster.findMany({
                where: {
                    companyId: company.id,
                },
            }),
            prisma.notification.findMany({
                where: {
                    companyId: company.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 6,
            }),
            prisma.activity.findMany({
                where: {
                    companyId: company.id,
                },
                include: {
                    branch: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 6,
            }),
        ]);

        const departmentMap = complianceMasters.reduce((acc, item) => {
            const department = item.department || "Unassigned";
            acc[department] ||= {
                department,
                total: 0,
                completed: 0,
                overdue: 0,
                pending: 0,
            };

            acc[department].total += 1;

            const status = getEffectiveStatus(item, today);
            if (status === "Completed") acc[department].completed += 1;
            else if (status === "Overdue") acc[department].overdue += 1;
            else acc[department].pending += 1;

            return acc;
        }, {});

        const departmentRanking = Object.values(departmentMap)
            .map((item) => ({
                ...item,
                score:
                    item.total > 0
                        ? Math.round((item.completed / item.total) * 100)
                        : 0,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);

        const topRisks = complianceMasters
            .map((item) => ({
                id: item.id,
                title: item.compliance || item.complianceType || "Compliance",
                risk: getEffectiveRisk(item, today),
                status: getEffectiveStatus(item, today),
                dueDate: item.dueDate,
                department: item.department || "Unassigned",
            }))
            .filter((item) => item.risk === "High" || item.status === "Overdue")
            .slice(0, 6);

        const aiAlerts = recentUploads
            .flatMap((upload) =>
                (upload.aiAnalysis?.issues || []).map((issue) => ({
                    id: `${upload.id}-${issue}`,
                    title: upload.title,
                    message: issue,
                    risk: upload.riskLevel || "Medium",
                    createdAt: upload.createdAt,
                })),
            )
            .slice(0, 6);

        const fallbackActivities = recentUploads.map((upload) => ({
            id: upload.id,
            type: "upload",
            description: `Uploaded ${upload.title}`,
            createdAt: upload.createdAt,
        }));

        return res.json({
            success: true,
            widgets: {
                todayTasks: todayTasks.map((item) => ({
                    id: item.id,
                    title: item.compliance || item.complianceType || "Compliance task",
                    dueDate: item.dueDate,
                    status: getEffectiveStatus(item, today),
                    department: item.department || "Unassigned",
                })),
                upcomingRenewals: upcomingRenewals.map((item) => ({
                    id: item.id,
                    title: item.compliance || item.complianceType || "Renewal",
                    expiryDate: item.expiryDate,
                    risk: getEffectiveRisk(item, today),
                })),
                recentUploads,
                aiAlerts,
                notifications,
                departmentRanking,
                topRisks,
                recentActivities:
                    activities.length > 0 ? activities : fallbackActivities,
            },
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard widgets",
        });
    }
};

const getBranches = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const branches = await companyService.getBranchesForCompany(company.id);

        return res.json({
            success: true,
            branches,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch branches",
        });
    }
};

const getCompanyEmployees = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const employees = await companyService.getEmployeesForCompany(company.id);

        return res.json({
            success: true,
            count: employees.length,
            employees,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to fetch employees" });
    }
};

const createBranch = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const branch = await companyService.createBranch(company.id, req.body);

        await logAudit({
            req,
            action: "BRANCH_CREATED",
            entityType: "Branch",
            entityId: branch.id,
            companyId: company.id,
            changes: branch,
            reason: "Company created branch",
        });

        return res.status(201).json({
            success: true,
            branch,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to create branch",
        });
    }
};

const updateBranch = async (req, res) => {
    try {
        const branch = await companyService.updateBranch(
            req.params.branchId,
            req.body,
        );

        await logAudit({
            req,
            action: "BRANCH_UPDATED",
            entityType: "Branch",
            entityId: branch.id,
            companyId: branch.companyId,
            changes: req.body,
            reason: "Company updated branch",
        });

        return res.json({
            success: true,
            branch,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update branch",
        });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const branch = await companyService.deleteBranch(req.params.branchId);

        await logAudit({
            req,
            action: "BRANCH_DELETED",
            entityType: "Branch",
            entityId: branch.id,
            companyId: branch.companyId,
            changes: {
                name: branch.name,
                code: branch.code,
            },
            reason: "Company deleted branch",
        });

        return res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete branch",
        });
    }
};

const getCompanyDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await prisma.company.findUnique({
            where: { id },

            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },

                uploads: true,
            },
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            company,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
        } = req.body;

        const company = await prisma.company.update({
            where: {
                id,
            },

            data: {
                name,
                email,
            },
        });

        await logAudit({
            req,
            action: "COMPANY_UPDATED",
            entityType: "Company",
            entityId: company.id,
            companyId: company.id,
            changes: {
                name,
                email,
            },
            reason: `${req.user.role} updated company`,
        });

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            company,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getCompanyDocuments = async (req, res) => {
    try {
        const { id } = req.params;

        const uploads =
            await prisma.complianceUpload.findMany({
                where: {
                    companyId: id,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return res.status(200).json({
            success: true,
            documents: uploads,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getCompanyAnalytics = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const uploads =
            await prisma.complianceUpload.findMany({
                where: {
                    companyId: id,
                },
            });

        const totalUploads =
            uploads.length;

        const avgScore =
            uploads.length > 0
                ? uploads.reduce(
                    (sum, item) =>
                        sum +
                        (item.complianceScore || 0),
                    0
                ) / uploads.length
                : 0;

        const highRiskCount =
            uploads.filter(
                (u) => u.riskLevel === "High"
            ).length;

        const mediumRiskCount =
            uploads.filter(
                (u) => u.riskLevel === "Medium"
            ).length;

        const lowRiskCount =
            uploads.filter(
                (u) => u.riskLevel === "Low"
            ).length;

        return res.status(200).json({
            success: true,

            analytics: {
                totalUploads,

                averageComplianceScore:
                    Number(avgScore.toFixed(2)),

                highRiskCount,

                mediumRiskCount,

                lowRiskCount,
            },
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getDashboardAnalytics = async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
            include: {
                uploads: true,
            },
        });

        const uploads = company.uploads;

        const highRisk = uploads.filter(
            (u) => u.riskLevel === "High"
        ).length;

        const mediumRisk = uploads.filter(
            (u) => u.riskLevel === "Medium"
        ).length;

        const lowRisk = uploads.filter(
            (u) => u.riskLevel === "Low"
        ).length;

        res.json({
            success: true,

            kpis: {
                totalUploads: uploads.length,

                complianceScore:
                    uploads.length > 0
                        ? Math.round(
                            uploads.reduce(
                                (sum, item) =>
                                    sum +
                                    (item.complianceScore || 0),
                                0
                            ) / uploads.length
                        )
                        : 0,
            },

            riskDistribution: {
                highRisk,
                mediumRisk,
                lowRisk,
            },
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
        });
    }
};

const addManualCompliance = async (req, res) => {
    try {
        const {
            companyName,
            gstNumber,
            panNumber,
            complianceType,
            expiryDate,
            complianceScore,
            riskLevel,
        } = req.body;

        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        const compliance =
            await prisma.complianceUpload.create({
                data: {
                    title: complianceType,
                    companyId: company.id,
                    uploadedById: req.user.id,

                    complianceScore: Number(complianceScore),

                    riskLevel,

                    extractedData: [
                        {
                            companyName,
                            gstNumber,
                            panNumber,
                            complianceType,
                            expiryDate,
                        },
                    ],
                },
            });

        await logAudit({
            req,
            action: "MANUAL_COMPLIANCE_CREATED",
            entityType: "ComplianceUpload",
            entityId: compliance.id,
            companyId: company.id,
            changes: {
                complianceType,
                complianceScore,
                riskLevel,
            },
            reason: "Company added manual compliance",
        });

        return res.json({
            success: true,
            compliance,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
        });
    }
};

module.exports = {
    createCompanyController,
    getCompanyDashboard,
    getCompanyProfile,
    updateCompanyProfile,
    getDashboardWidgets,
    getBranches,
    getCompanyEmployees,
    createBranch,
    updateBranch,
    deleteBranch,
    getCompanyDetails,
    updateCompany,
    getCompanyDocuments,
    getCompanyAnalytics,
    getDashboardAnalytics,
    addManualCompliance
};
