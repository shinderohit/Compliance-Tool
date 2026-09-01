const prisma = require("../../config/prisma");
const {
    getEffectiveRisk,
    getEffectiveStatus,
    startOfToday,
} = require("./compliance.metrics");

const createUpload = async (data) => {
    return await prisma.complianceUpload.create({
        data,
    });
};

const getCompanyUploads = async (
    companyId,
    filters = {}
) => {
    return await prisma.complianceUpload.findMany(
        {
            where: {
                companyId,
                ...(filters.branchId && { branchId: filters.branchId }),
            },

            orderBy: {
                createdAt: "desc",
            },
        }
    );
};

const buildCompanyWhere = (companyScope, filters = {}) => {
    const where = {};

    if (Array.isArray(companyScope)) {
        where.companyId = {
            in: companyScope,
        };
    } else if (companyScope) {
        where.companyId = companyScope;
    }

    if (filters.branchId) {
        where.branchId = filters.branchId;
    }

    return where;
};

const buildUploadWhere = (companyScope, filters = {}) => {
    const where = {};

    if (Array.isArray(companyScope)) {
        where.companyId = {
            in: companyScope,
        };
    } else if (companyScope) {
        where.companyId = companyScope;
    }

    if (filters.branchId) {
        where.branchId = filters.branchId;
    }

    return where;
};

/*
const buildCompanyWhereLegacy = (companyScope) => {
    if (!companyScope) return {};

    if (Array.isArray(companyScope)) {
        return {
            companyId: {
                in: companyScope,
            },
        };
    }

    return { companyId: companyScope };
};
*/

const getComplianceAnalytics = async (
    companyScope,
    filters = {}
) => {
    const where = buildCompanyWhere(companyScope, filters);
    const uploadWhere = buildUploadWhere(companyScope, filters);

    const [uploads, compliances] = await Promise.all([
        prisma.complianceUpload.findMany({
            where: uploadWhere,
            orderBy: { createdAt: "asc" },
        }),
        prisma.complianceMaster.findMany({
            where,
            orderBy: { createdAt: "asc" },
        }),
    ]);

    const totalUploads = uploads.length;
    const totalCompliances = compliances.length;
    const today = startOfToday();

    const completed = compliances.filter(
        (item) => getEffectiveStatus(item, today) === "Completed"
    ).length;

    const overdue = compliances.filter(
        (item) => getEffectiveStatus(item, today) === "Overdue"
    ).length;

    const pending = compliances.filter(
        (item) => getEffectiveStatus(item, today) === "Pending"
    ).length;

    const complianceHighRisk = compliances.filter(
        (item) => getEffectiveRisk(item, today) === "High"
    ).length;

    const complianceMediumRisk = compliances.filter(
        (item) => getEffectiveRisk(item, today) === "Medium"
    ).length;

    const complianceLowRisk = compliances.filter(
        (item) => getEffectiveRisk(item, today) === "Low"
    ).length;

    const useComplianceRisk = totalCompliances > 0;
    const highRisk = useComplianceRisk
        ? complianceHighRisk
        : uploads.filter((u) => u.riskLevel === "High").length;
    const mediumRisk = useComplianceRisk
        ? complianceMediumRisk
        : uploads.filter((u) => u.riskLevel === "Medium").length;
    const lowRisk = useComplianceRisk
        ? complianceLowRisk
        : uploads.filter((u) => u.riskLevel === "Low").length;

    const scoredCompliances = compliances.filter(
        (item) => typeof item.complianceScore === "number"
    );
    const scoreSource =
        scoredCompliances.length > 0 ? scoredCompliances : uploads;
    const averageScore =
        scoreSource.reduce(
            (acc, curr) => acc + (curr.complianceScore || 0),
            0
        ) / (scoreSource.length || 1);

    // Monthly upload trend (last 6 months, oldest -> newest)
    const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "2-digit",
    });

    const monthBuckets = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthBuckets.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: monthFormatter.format(d),
            uploads: 0,
            averageScore: 0,
            scoreSum: 0,
            scoreCount: 0,
            pending: 0,
            overdue: 0,
            completed: 0,
        });
    }

    const monthlySource =
        compliances.length > 0 ? compliances : uploads;

    monthlySource.forEach((u) => {
        const d = new Date(u.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const bucket = monthBuckets.find((b) => b.key === key);
        if (bucket) {
            bucket.uploads += 1;
            if (typeof u.complianceScore === "number") {
                bucket.scoreSum += u.complianceScore;
                bucket.scoreCount += 1;
            }

            if (compliances.length > 0) {
                const effectiveStatus = getEffectiveStatus(u, today);
                if (effectiveStatus === "Completed") bucket.completed += 1;
                else if (effectiveStatus === "Overdue") bucket.overdue += 1;
                else if (effectiveStatus === "Pending") bucket.pending += 1;
            }
        }
    });

    const monthlyTrend = monthBuckets.map((b) => ({
        month: b.label,
        uploads: b.uploads,
        averageScore:
            b.scoreCount > 0
                ? Math.round(b.scoreSum / b.scoreCount)
                : 0,
        pending: b.pending,
        overdue: b.overdue,
        completed: b.completed,
    }));

    // Recent AI-style issues, derived from real upload analysis (most recent first)
    const recentIssues = uploads
        .slice()
        .reverse()
        .slice(0, 5)
        .map((u) => ({
            id: u.id,
            title: u.title,
            riskLevel: u.riskLevel || "Low",
            complianceScore: u.complianceScore ?? null,
            issues: u.aiAnalysis?.issues || [],
            createdAt: u.createdAt,
        }));

    const departmentMap = compliances.reduce((acc, item) => {
        const department = item.department || "Unassigned";

        if (!acc[department]) {
            acc[department] = {
                department,
                total: 0,
                pending: 0,
                overdue: 0,
                completed: 0,
                highRisk: 0,
                mediumRisk: 0,
                lowRisk: 0,
            };
        }

        const row = acc[department];
        row.total += 1;

        const effectiveStatus = getEffectiveStatus(item, today);
        if (effectiveStatus === "Completed") row.completed += 1;
        else if (effectiveStatus === "Overdue") row.overdue += 1;
        else if (effectiveStatus === "Pending") row.pending += 1;

        const effectiveRisk = getEffectiveRisk(item, today);
        if (effectiveRisk === "High") row.highRisk += 1;
        if (effectiveRisk === "Medium") row.mediumRisk += 1;
        if (effectiveRisk === "Low") row.lowRisk += 1;

        return acc;
    }, {});

    const departmentWise = Object.values(departmentMap);

    const stateMap = compliances.reduce((acc, item) => {
        const state = item.state || "Unassigned";

        if (!acc[state]) {
            acc[state] = {
                state,
                completed: 0,
                pending: 0,
                overdue: 0,
            };
        }

        const effectiveStatus = getEffectiveStatus(item, today);
        if (effectiveStatus === "Completed") acc[state].completed += 1;
        else if (effectiveStatus === "Overdue") acc[state].overdue += 1;
        else if (effectiveStatus === "Pending") acc[state].pending += 1;

        return acc;
    }, {});

    const lawAreaMap = compliances.reduce((acc, item) => {
        const area = item.lawArea || "Unassigned";

        if (!acc[area]) {
            acc[area] = {
                area,
                completed: 0,
                pending: 0,
            };
        }

        const effectiveStatus = getEffectiveStatus(item, today);
        if (effectiveStatus === "Completed") acc[area].completed += 1;
        else acc[area].pending += 1;

        return acc;
    }, {});

    return {
        totalUploads,
        totalCompliances,
        pending,
        overdue,
        completed,
        highRisk,
        mediumRisk,
        lowRisk,
        averageScore: Math.round(averageScore),
        monthlyTrend,
        recentIssues,
        departmentWise,
        stateWise: Object.values(stateMap),
        lawAreaWise: Object.values(lawAreaMap),
        companyProgress: monthlyTrend.map((item) => ({
            month: item.month,
            progress: item.averageScore,
        })),
        statusDistribution: [
            { name: "Pending", value: pending },
            { name: "Overdue", value: overdue },
            { name: "Completed", value: completed },
        ],
    };
};

const findCompanyByUserId = async (
    userId
) => {
    return await prisma.company.findUnique({
        where: {
            userId,
        },
    });
};

const deleteUpload = async (uploadId, companyId) => {
    const upload = await prisma.complianceUpload.findUnique({
        where: { id: uploadId },
    });

    if (!upload || upload.companyId !== companyId) {
        return null;
    }

    await prisma.complianceUpload.delete({
        where: { id: uploadId },
    });

    return upload;
};

// ========== Compliance Items ==========
const createComplianceItem = async (data) => {
    try {
        return await prisma.complianceItem.create({
            data: {
                title: data.title,
                description: data.description,
                companyId: data.companyId,
                branchId: data.branchId,
                lawAreaId: data.lawAreaId,
                frequencyId: data.frequencyId,
                authorityId: data.authorityId,
                assignedToId: data.assignedToId,
                status: data.status || 'Open',
                priority: data.priority || 'Medium',
                riskLevel: data.riskLevel,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                isRecurring: data.isRecurring || false,
                recurrencePattern: data.recurrencePattern,
            },
            include: {
                lawArea: true,
                authority: true,
                frequency: true,
                branch: true,
                assignedTo: {
                    include: {
                        department: true,
                        designation: true,
                    },
                },
            },
        });
    } catch (error) {
        throw new Error(`Failed to create compliance item: ${error.message}`);
    }
};

const getComplianceItemsForCompany = async (companyId, filters = {}) => {
    try {
        const where = {
            companyId,
            ...(filters.branchId && { branchId: filters.branchId }),
            ...(filters.status && { status: filters.status }),
            ...(filters.priority && { priority: filters.priority }),
            ...(filters.riskLevel && { riskLevel: filters.riskLevel }),
        };

        return await prisma.complianceItem.findMany({
            where,
            include: {
                lawArea: true,
                authority: true,
                frequency: true,
                branch: true,
                assignedTo: {
                    include: {
                        department: true,
                        designation: true,
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
    } catch (error) {
        throw new Error(`Failed to fetch compliance items: ${error.message}`);
    }
};

const updateComplianceItem = async (itemId, data, changedBy) => {
    try {
        const existingItem = await prisma.complianceItem.findUnique({
            where: { id: itemId },
        });

        if (existingItem && data.status && data.status !== existingItem.status) {
            await prisma.auditTrail.create({
                data: {
                    complianceItemId: itemId,
                    action: 'status_changed',
                    oldValue: { status: existingItem.status },
                    newValue: { status: data.status },
                    changedBy,
                },
            });
        }

        return await prisma.complianceItem.update({
            where: { id: itemId },
            data,
            include: {
                lawArea: true,
                authority: true,
                assignedTo: true,
                auditTrails: true,
            },
        });
    } catch (error) {
        throw new Error(`Failed to update compliance item: ${error.message}`);
    }
};

const assignCompliance = async (itemId, employeeId, changedBy) => {
    try {
        await prisma.auditTrail.create({
            data: {
                complianceItemId: itemId,
                action: 'assigned',
                newValue: { assignedToId: employeeId },
                changedBy,
            },
        });

        return await prisma.complianceItem.update({
            where: { id: itemId },
            data: { assignedToId: employeeId },
            include: {
                assignedTo: true,
            },
        });
    } catch (error) {
        throw new Error(`Failed to assign compliance: ${error.message}`);
    }
};

// ========== Notifications ==========
const createNotification = async (data) => {
    try {
        return await prisma.notification.create({
            data: {
                companyId: data.companyId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data || null,
            },
        });
    } catch (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
    }
};

const getNotifications = async (companyId, unreadOnly = false) => {
    try {
        return await prisma.notification.findMany({
            where: {
                companyId,
                ...(unreadOnly && { isRead: false }),
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    } catch (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
};

const markNotificationAsRead = async (notificationId) => {
    try {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    } catch (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
};

// ========== Activities ==========
const logActivity = async (data) => {
    try {
        return await prisma.activity.create({
            data: {
                companyId: data.companyId,
                branchId: data.branchId,
                createdById: data.createdById,
                type: data.type,
                description: data.description,
                metadata: data.metadata || null,
            },
        });
    } catch (error) {
        throw new Error(`Failed to log activity: ${error.message}`);
    }
};

const getActivities = async (companyId, limit = 50) => {
    try {
        return await prisma.activity.findMany({
            where: { companyId },
            include: {
                createdBy: {
                    include: {
                        department: true,
                        designation: true,
                    },
                },
                branch: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    } catch (error) {
        throw new Error(`Failed to fetch activities: ${error.message}`);
    }
};

module.exports = {
    createUpload,
    getCompanyUploads,
    findCompanyByUserId,
    getComplianceAnalytics,
    deleteUpload,
    createComplianceItem,
    getComplianceItemsForCompany,
    updateComplianceItem,
    assignCompliance,
    createNotification,
    getNotifications,
    markNotificationAsRead,
    logActivity,
    getActivities,
};
