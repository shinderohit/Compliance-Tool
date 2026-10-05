const prisma = require("../../config/prisma");

const getClientDashboard = async (req, res) => {
    try {
        const client = await prisma.client.findUnique({
            where: {
                userId: req.user.id,
            },
            include: {
                companies: {
                    include: {
                        uploads: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 10,
                },
            },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        const totalUploads = client.companies.reduce(
            (count, company) => count + company.uploads.length,
            0
        );

        return res.status(200).json({
            success: true,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                slug: client.slug,
                logo: client.logo,
            },
            stats: {
                totalCompanies: client.companies.length,
                totalUploads,
                riskAlerts: 0,
            },
            companies: client.companies.map((company) => ({
                id: company.id,
                name: company.name,
                email: company.email,
                slug: company.slug,
                totalUploads: company.uploads.length,
                loginUrl: `/company/${company.slug}/login`,
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

const getClientCompanies = async (req, res) => {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
        } = req.query;

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

        const where = {
            clientId: client.id,
            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }),
        };

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                include: {
                    uploads: true,
                    employees: true,
                    user: true,
                    client: {
                        include: {
                            kao: true,
                        },
                    },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.company.count({
                where,
            }),
        ]);

        return res.status(200).json({
            success: true,
            companies: companies.map((company) => ({
                ...company,
                totalUploads: company.uploads.length,
                totalEmployees: company.employees.length,
                isActive: company.user?.isActive ?? true,
            })),
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getClientEmployees = async (req, res) => {
    try {
        const client = await prisma.client.findUnique({
            where: { userId: req.user.id },
        });

        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        const employees = await prisma.employee.findMany({
            where: {
                company: {
                    clientId: client.id,
                },
            },
            include: {
                company: true,
                branch: true,
                department: true,
                designation: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json({
            success: true,
            count: employees.length,
            employees,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getClientDashboard,
    getClientCompanies,
    getClientEmployees,
};
