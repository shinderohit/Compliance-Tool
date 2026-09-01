const prisma = require("../../config/prisma");

const createUser = async (data) => {
    return await prisma.user.create({
        data,
    });
};

const createCompany = async (data) => {
    return await prisma.company.create({
        data,
    });
};

const findClientByUserId = async (userId) => {
    return await prisma.client.findUnique({
        where: {
            userId,
        },
    });
};

const getAllCompanies = async ({
    clientId,
    search,
    page,
    limit,
}) => {
    const skip = (page - 1) * limit;

    const where = {
        clientId,

        ...(search && {
            companyName: {
                contains: search,
                mode: "insensitive",
            },
        }),
    };

    const [companies, total] = await Promise.all([
        prisma.company.findMany({
            where,

            skip,
            take: limit,

            include: {
                user: true,
                uploads: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.company.count({
            where,
        }),
    ]);

    return {
        companies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

module.exports = {
    createUser,
    createCompany,
    findClientByUserId,
    getAllCompanies,
};