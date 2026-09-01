const prisma = require("../config/prisma");
const logger = require("../config/logger");

const getRequestMeta = (req) => ({
    ipAddress:
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        null,
    userAgent: req.headers["user-agent"] || null,
});

const logAudit = async ({
    req,
    action,
    entityType,
    entityId,
    companyId,
    changes,
    reason,
    status = "SUCCESS",
    errorMessage,
}) => {
    try {
        if (!req?.user || !prisma.auditLog) return null;

        const meta = getRequestMeta(req);

        return await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                userId: req.user.id,
                userEmail: req.user.email || "unknown",
                companyId: companyId || null,
                changes: changes || null,
                reason: reason || null,
                status,
                errorMessage: errorMessage || null,
                ...meta,
            },
        });
    } catch (error) {
        logger.error({ error }, "audit log failed");
        return null;
    }
};

module.exports = logAudit;
