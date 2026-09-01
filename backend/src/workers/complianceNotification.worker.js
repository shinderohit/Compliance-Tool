const prisma = require("../config/prisma");
const logger = require("../config/logger");
const { getEffectiveStatus, startOfToday } = require("../modules/compliance/compliance.metrics");

const DAY_MS = 24 * 60 * 60 * 1000;

const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const notificationExists = async ({ companyId, type, complianceId, dateKey }) => {
    const existing = await prisma.notification.findFirst({
        where: {
            companyId,
            type,
            data: {
                path: ["complianceId"],
                equals: complianceId,
            },
            createdAt: {
                gte: new Date(`${dateKey}T00:00:00.000Z`),
            },
        },
    });

    return Boolean(existing);
};

const createNotificationOnce = async ({ companyId, type, title, message, complianceId, dateKey }) => {
    const exists = await notificationExists({
        companyId,
        type,
        complianceId,
        dateKey,
    });

    if (exists) return null;

    return prisma.notification.create({
        data: {
            companyId,
            type,
            title,
            message,
            data: {
                complianceId,
                dateKey,
            },
        },
    });
};

const runComplianceNotificationSweep = async () => {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const renewalCutoff = addDays(today, 30);
    const dateKey = today.toISOString().slice(0, 10);

    const compliances = await prisma.complianceMaster.findMany({
        where: {
            OR: [
                {
                    dueDate: {
                        lt: tomorrow,
                    },
                },
                {
                    expiryDate: {
                        gte: today,
                        lte: renewalCutoff,
                    },
                },
            ],
        },
    });

    let createdCount = 0;

    for (const item of compliances) {
        const title = item.compliance || item.complianceType || "Compliance";
        const effectiveStatus = getEffectiveStatus(item, today);

        if (item.dueDate) {
            const dueDate = new Date(item.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate.getTime() === today.getTime()) {
                const created = await createNotificationOnce({
                    companyId: item.companyId,
                    type: "deadline",
                    title: "Compliance due today",
                    message: `${title} is due today.`,
                    complianceId: item.id,
                    dateKey,
                });
                if (created) createdCount += 1;
            }

            if (effectiveStatus === "Overdue") {
                const created = await createNotificationOnce({
                    companyId: item.companyId,
                    type: "deadline",
                    title: "Compliance overdue",
                    message: `${title} is overdue.`,
                    complianceId: item.id,
                    dateKey,
                });
                if (created) createdCount += 1;
            }
        }

        if (item.expiryDate) {
            const created = await createNotificationOnce({
                companyId: item.companyId,
                type: "renewal",
                title: "Renewal upcoming",
                message: `${title} expires within 30 days.`,
                complianceId: item.id,
                dateKey,
            });
            if (created) createdCount += 1;
        }
    }

    logger.info({ createdCount }, "compliance notification sweep completed");
    return createdCount;
};

const startComplianceNotificationWorker = () => {
    if (process.env.DISABLE_SCHEDULERS === "true") {
        logger.info("compliance notification worker disabled");
        return;
    }

    runComplianceNotificationSweep().catch((error) => {
        logger.error({ error }, "initial compliance notification sweep failed");
    });

    setInterval(() => {
        runComplianceNotificationSweep().catch((error) => {
            logger.error({ error }, "scheduled compliance notification sweep failed");
        });
    }, Number(process.env.COMPLIANCE_SWEEP_INTERVAL_MS || DAY_MS));
};

module.exports = {
    runComplianceNotificationSweep,
    startComplianceNotificationWorker,
};
