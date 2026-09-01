const prisma = require("../../config/prisma");

const getCompanyScope = async (req) => {
    if (req.user.role !== "COMPANY") return null;

    return prisma.company.findUnique({
        where: { userId: req.user.id },
    });
};

const getKaoScope = async (req) => {
    if (req.user.role !== "KAO") return null;

    return prisma.kao.findUnique({
        where: { userId: req.user.id },
        include: {
            clients: {
                select: {
                    id: true,
                    companies: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        },
    });
};

const getAuditLogs = async (req, res) => {
    try {
        const company = await getCompanyScope(req);
        const kao = await getKaoScope(req);

        if (req.user.role === "COMPANY" && !company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        if (req.user.role === "KAO" && !kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const clientIds = kao?.clients.map((client) => client.id) || [];
        const companyIds = kao?.clients.flatMap((client) => client.companies.map((item) => item.id)) || [];

        const where = company
            ? { companyId: company.id }
            : kao
                ? {
                    OR: [
                        { userId: req.user.id },
                        { entityType: "Client", entityId: { in: clientIds } },
                        { companyId: { in: companyIds } },
                    ],
                }
                : {};

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            take: 200,
        });

        return res.json({
            success: true,
            logs,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs",
        });
    }
};

module.exports = {
    getAuditLogs,
};
