const prisma = require("../../config/prisma");
const extractExcelData = require("../../ai/extractors/excelExtractor");
const path = require("path");
const {
    analyzeComplianceDocument,
} = require("../../ai/services/openaiService");
const {
    createUpload,
    getCompanyUploads,
    findCompanyByUserId,
    getComplianceAnalytics,
    deleteUpload,
} = require("./compliance.service");
const logAudit = require("../../utils/auditLogger");
const storageService = require("../../services/storage/storage.service");
const {
    getEffectiveRisk,
    getEffectiveStatus,
    startOfToday,
} = require("./compliance.metrics");
const {
    normalizeComplianceBody,
    buildComplianceMasterData,
} = require("./complianceMaster.service");

const analyzeRows = (rows) => {
    const issues = [];
    let score = 100;
    const now = new Date();

    rows.forEach((row, index) => {
        const rowIndex = index + 1;

        if (!row.companyName) {
            issues.push(`Row ${rowIndex}: missing company name`);
            score -= 15;
        }
        if (!row.gstNumber) {
            issues.push(`Row ${rowIndex}: missing GST number`);
            score -= 15;
        }
        if (!row.panNumber) {
            issues.push(`Row ${rowIndex}: missing PAN number`);
            score -= 15;
        }
        if (!row.complianceType) {
            issues.push(`Row ${rowIndex}: missing compliance type`);
            score -= 10;
        }
        if (row.expiryDate) {
            const expiry = new Date(row.expiryDate);
            if (!Number.isNaN(expiry.getTime())) {
                const diffDays = Math.ceil(
                    (expiry - now) / (1000 * 60 * 60 * 24),
                );
                if (diffDays < 0) {
                    issues.push(`Row ${rowIndex}: expiry date has passed`);
                    score -= 25;
                } else if (diffDays <= 30) {
                    issues.push(`Row ${rowIndex}: expiry within 30 days`);
                    score -= 10;
                }
            }
        } else {
            issues.push(`Row ${rowIndex}: missing expiry date`);
            score -= 10;
        }
    });

    if (score < 0) score = 0;

    const riskLevel =
        score <= 40
            ? "High"
            : score <= 70
                ? "Medium"
                : "Low";

    return {
        complianceScore: Number(score.toFixed(0)),
        riskLevel,
        issues,
        totalRows: rows.length,
    };
};

const getCompanyBranch = async (companyId, branchId) => {
    if (!branchId) return null;

    return prisma.branch.findFirst({
        where: {
            id: branchId,
            companyId,
        },
    });
};

const uploadComplianceController =
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Excel file is required",
                });
            }

            const company = await findCompanyByUserId(
                req.user.id,
            );

            if (!company) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Company not found for user",
                });
            }

            const extractedData = await extractExcelData(
                req.file.path,
            );

            const analysis = analyzeRows(
                extractedData,
            );

            const upload = await createUpload({
                title: req.file.originalname,
                fileUrl: storageService.getFileMetadata(req.file).fileUrl,
                extractedData,
                aiAnalysis: analysis,
                complianceScore:
                    analysis.complianceScore,
                riskLevel: analysis.riskLevel,
                companyId: company.id,
                uploadedById: req.user.id,
            });

            res.status(201).json({
                success: true,
                message:
                    "Compliance file uploaded and analyzed successfully",
                data: upload,
            });
        } catch (error) {
            console.log(error);

            res.status(500).json({
                success: false,
                message: "Upload failed",
            });
        }
    };

const analyzeComplianceDocumentController =
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "A compliance document is required",
                });
            }

            const company = await findCompanyByUserId(
                req.user.id,
            );

            if (!company) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Company not found for user",
                });
            }

            const extension = path.extname(req.file.originalname).toLowerCase();
            let extractedData;
            let analysis;
            let analyzer = "OpenAI";

            try {
                const aiResult = await analyzeComplianceDocument(req.file);
                const record = {
                    ...aiResult.record,
                    compliance: aiResult.record?.complianceName,
                    riskLevel: aiResult.riskLevel,
                };

                Object.entries(aiResult.registrations || {}).forEach(
                    ([key, registration]) => {
                        record[`${key}Number`] = registration?.number || null;
                        record[`${key}ApplicableDate`] =
                            registration?.applicableDate || null;
                        record[`${key}ExpiryDate`] =
                            registration?.expiryDate || null;
                    },
                );

                extractedData = [record];
                analysis = {
                    complianceScore: aiResult.complianceScore,
                    riskLevel: aiResult.riskLevel,
                    issues: aiResult.issues,
                    recommendations: aiResult.recommendations,
                    summary: aiResult.summary,
                    registrations: aiResult.registrations,
                    branches: aiResult.branches,
                    totalRows: 1,
                };
            } catch (aiError) {
                const isSpreadsheet = [".xlsx", ".xls", ".csv"].includes(
                    extension,
                );

                if (!isSpreadsheet) throw aiError;

                extractedData = await extractExcelData(req.file.path);
                analysis = analyzeRows(extractedData);
                analysis.summary =
                    "Spreadsheet analyzed with the built-in compliance rules.";
                analysis.recommendations = [];
                analyzer = "Built-in rules";
            }

            const fileMetadata = storageService.getFileMetadata(req.file);
            const upload = await createUpload({
                title: req.file.originalname,
                fileUrl: fileMetadata.fileUrl,
                extractedData,
                aiAnalysis: {
                    ...analysis,
                    analyzer,
                },
                complianceScore:
                    analysis.complianceScore,
                riskLevel: analysis.riskLevel,
                companyId: company.id,
                uploadedById: req.user.id,
            });

            res.status(200).json({
                success: true,
                message:
                    "Compliance document analyzed successfully",
                data: {
                    id: upload.id,
                    title: req.file.originalname,
                    fileUrl: fileMetadata.fileUrl,
                    extractedData,
                    aiAnalysis: upload.aiAnalysis,
                    complianceScore:
                        analysis.complianceScore,
                    riskLevel: analysis.riskLevel,
                    createdAt: upload.createdAt,
                    analyzer,
                    summary: analysis.summary || "",
                    issues: analysis.issues || [],
                    recommendations: analysis.recommendations || [],
                    registrations: analysis.registrations || {},
                    branches: analysis.branches || [],
                },
            });
        } catch (error) {
            console.log(error);

            res.status(
                error.code === "OPENAI_API_KEY_MISSING" ? 503 : 500,
            ).json({
                success: false,
                message:
                    error.code === "OPENAI_API_KEY_MISSING"
                        ? error.message
                        : "Document analysis failed",
            });
        }
    };

const getUploadsController =
    async (req, res) => {
        try {
            let uploads;

            if (
                req.user &&
                req.user.role === "COMPANY"
            ) {
                const company = await findCompanyByUserId(
                    req.user.id,
                );
                if (!company) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Company not found for user",
                    });
                }
                const branchId = req.query.branchId;
                if (branchId && !(await getCompanyBranch(company.id, branchId))) {
                    return res.status(404).json({
                        success: false,
                        message: "Branch not found",
                    });
                }
                uploads = await getCompanyUploads(
                    company.id,
                    { branchId },
                );
            } else {
                uploads = await prisma.complianceUpload.findMany({
                    include: {
                        uploadedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                        company: {
                            include: {
                                client: {
                                    include: {
                                        kao: true,
                                    },
                                },
                            },
                        },
                        branch: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }

            res.json(uploads);
        } catch (error) {
            console.log(error);

            res.status(500).json({
                message:
                    "Failed to fetch uploads",
            });
        }
    };

const getAnalyticsController =
    async (req, res) => {
        try {
            let companyScope;

            if (req.user.role === "COMPANY") {
                const company = await findCompanyByUserId(
                    req.user.id,
                );

                if (!company) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Company not found for user",
                    });
                }

                companyScope = company.id;
            } else if (req.user.role === "CLIENT") {
                const client = await prisma.client.findUnique({
                    where: {
                        userId: req.user.id,
                    },
                    include: {
                        companies: {
                            select: {
                                id: true,
                            },
                        },
                    },
                });

                if (!client) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Client not found for user",
                    });
                }

                companyScope = client.companies.map(
                    (company) => company.id,
                );
            } else if (req.user.role === "KAO") {
                const kao = await prisma.kao.findUnique({
                    where: {
                        userId: req.user.id,
                    },
                    include: {
                        clients: {
                            include: {
                                companies: {
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (!kao) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "KAO not found for user",
                    });
                }

                companyScope = kao.clients.flatMap((client) =>
                    client.companies.map((company) => company.id),
                );
            } else if (req.user.role !== "SUPER_ADMIN") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Analytics unavailable for this user role",
                });
            }

            const filters = {};

            if (req.user.role === "COMPANY" && req.query.branchId) {
                const branch = await getCompanyBranch(companyScope, req.query.branchId);
                if (!branch) {
                    return res.status(404).json({
                        success: false,
                        message: "Branch not found",
                    });
                }
                filters.branchId = req.query.branchId;
            }

            const analytics = await getComplianceAnalytics(
                companyScope,
                filters,
            );

            res.json(analytics);
        } catch (error) {
            console.log(error);

            res.status(500).json({
                message:
                    "Analytics fetch failed",
            });
        }
    };

const getAllCompliances = async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const compliances =
            await prisma.complianceUpload.findMany({
                where: {
                    companyId: company.id,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        res.status(200).json({
            success: true,
            compliances,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const createCompliance = async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const complianceBody = normalizeComplianceBody(req);
        const branchId = complianceBody.branchId || null;

        if (branchId && !(await getCompanyBranch(company.id, branchId))) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
            });
        }

        const compliance =
            await prisma.complianceMaster.create({
                data: buildComplianceMasterData(complianceBody, company.id, {
                    companyName: company.name,
                    branchId,
                }),
            });

        await prisma.notification.create({
            data: {
                companyId: company.id,
                type: "task",
                title: "Compliance record created",
                message: `${compliance.compliance || compliance.complianceType || "Compliance"} was added to Compliance Master.`,
                data: { complianceId: compliance.id },
            },
        });

        await logAudit({
            req,
            action: "CREATE",
            entityType: "ComplianceMaster",
            entityId: compliance.id,
            companyId: company.id,
            changes: { after: compliance },
        });

        res.status(201).json({  
            success: true,
            compliance,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
        });
    }
};

const getComplianceMaster = async (
    req,
    res
) => {
    try {
        let where = {};

        if (req.user.role === "COMPANY") {
            const company = await prisma.company.findUnique({
                where: {
                    userId: req.user.id,
                },
            });

            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: "Company not found",
                });
            }

            where = {
                companyId: company.id,
            };

            if (req.query.branchId) {
                const branch = await getCompanyBranch(company.id, req.query.branchId);
                if (!branch) {
                    return res.status(404).json({
                        success: false,
                        message: "Branch not found",
                    });
                }

                where.branchId = req.query.branchId;
            }
        }

        const compliances =
            await prisma.complianceMaster.findMany({
                where,

                include: {
                    branch: true,
                    company: {
                        include: {
                            client: {
                                include: {
                                    kao: true,
                                },
                            },
                        },
                    },
                },

                orderBy: {
                    dueDate: "asc",
                },

                take: req.user.role === "SUPER_ADMIN" ? 10 : undefined,
            });

        res.json({
            success: true,
            compliances: compliances.map((item) => ({
                ...item,
                companyName: item.companyName || item.company?.name || null,
                branchName: item.branch?.name || null,
                clientName: item.company?.client?.name || null,
                kaoName: item.company?.client?.kao?.name || null,
                effectiveStatus: getEffectiveStatus(item),
                effectiveRisk: getEffectiveRisk(item),
            })),
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
        });
    }
};

const getComplianceKPIs = async (
    req,
    res
) => {
    try {
        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const where = {
            companyId: company.id,
        };

        if (req.query.branchId) {
            const branch = await getCompanyBranch(company.id, req.query.branchId);
            if (!branch) {
                return res.status(404).json({
                    success: false,
                    message: "Branch not found",
                });
            }

            where.branchId = req.query.branchId;
        }

        const compliances =
            await prisma.complianceMaster.findMany({
                where,
            });

        const today = startOfToday();

        const total = compliances.length;

        const complied = compliances.filter(
            (item) => getEffectiveStatus(item, today) === "Completed",
        ).length;

        const overdue = compliances.filter(
            (item) => getEffectiveStatus(item, today) === "Overdue",
        ).length;

        const dueToday =
            compliances.filter((x) => {
                if (!x.dueDate) return false;

                return (
                    new Date(x.dueDate)
                        .toDateString() ===
                    today.toDateString()
                );
            }).length;

        const pending = compliances.filter(
            (item) => getEffectiveStatus(item, today) === "Pending",
        ).length;

        res.json({
            success: true,

            cards: {
                total,
                complied,
                overdue,
                dueToday,
                pending,
            },
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch compliance KPIs",
        });
    }
};

const createComplianceMaster = async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const complianceBody = normalizeComplianceBody(req);
        const branchId = complianceBody.branchId || null;

        if (branchId && !(await getCompanyBranch(company.id, branchId))) {
            return res.status(404).json({
                success: false,
                message: "Branch not found",
            });
        }

        const compliance =
            await prisma.complianceMaster.create({
                data: buildComplianceMasterData(complianceBody, company.id, {
                    companyName: company.name,
                    branchId,
                }),
            });

        await prisma.notification.create({
            data: {
                companyId: company.id,
                type: "task",
                title: "Compliance record created",
                message: `${compliance.compliance || compliance.complianceType || "Compliance"} was added to Compliance Master.`,
                data: { complianceId: compliance.id },
            },
        });

        await logAudit({
            req,
            action: "CREATE",
            entityType: "ComplianceMaster",
            entityId: compliance.id,
            companyId: company.id,
            changes: { after: compliance },
        });

        res.status(201).json({
            success: true,
            compliance,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const createBulkComplianceMaster = async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No compliance rows found",
            });
        }

        const branchIds = [
            ...new Set(
                [
                    req.body.branchId,
                    ...rows
                    .map((row) => row.branchId)
                ].filter(Boolean),
            ),
        ];

        if (branchIds.length > 0) {
            const branchCount = await prisma.branch.count({
                where: {
                    companyId: company.id,
                    id: {
                        in: branchIds,
                    },
                },
            });

            if (branchCount !== branchIds.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more branches were not found",
                });
            }
        }

        const defaults = {
            companyName: company.name,
            complianceScore: req.body.complianceScore,
            riskLevel: req.body.riskLevel,
            documents: req.body.documents || {},
            branches: req.body.branches || [],
            branchId: req.body.branchId || null,
        };

        const created = await prisma.$transaction(
            rows.map((row) =>
                prisma.complianceMaster.create({
                    data: buildComplianceMasterData(row, company.id, defaults),
                }),
            ),
        );

        await prisma.notification.create({
            data: {
                companyId: company.id,
                type: "task",
                title: "Bulk compliance import completed",
                message: `${created.length} compliance records were added to Compliance Master.`,
                data: { count: created.length },
            },
        });

        await logAudit({
            req,
            action: "BULK_CREATE",
            entityType: "ComplianceMaster",
            entityId: "bulk",
            companyId: company.id,
            changes: { count: created.length },
        });

        return res.status(201).json({
            success: true,
            message: `${created.length} compliance records added successfully`,
            compliances: created,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add compliance records",
        });
    }
};

const deleteUploadController = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "COMPANY") {
            return res.status(403).json({
                success: false,
                message: "Only company users can delete their uploads",
            });
        }

        const company = await findCompanyByUserId(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found for user",
            });
        }

        const deleted = await deleteUpload(req.params.id, company.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Upload not found",
            });
        }

        return res.json({
            success: true,
            message: "Upload deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete upload",
        });
    }
};

module.exports = {
    uploadComplianceController,
    analyzeComplianceDocumentController,
    getUploadsController,
    getAnalyticsController,
    getAllCompliances,
    createCompliance,
    getComplianceMaster,
    getComplianceKPIs,
    createComplianceMaster,
    createBulkComplianceMaster,
    deleteUploadController,
};
