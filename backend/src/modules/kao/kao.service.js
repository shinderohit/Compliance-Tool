const prisma = require("../../config/prisma");

const createUser = async (data) => {
    return await prisma.user.create({
        data,
    });
};

const createClient = async (data) => {
    return await prisma.client.create({
        data,
    });
};

const findKaoByUserId = async (userId) => {
    return await prisma.kao.findUnique({
        where: {
            userId,
        },
    });
};

const getAllClients = async ({
    kaoId,
    search,
    page,
    limit,
}) => {
    const skip = (page - 1) * limit;

    const where = {
        kaoId,

        ...(search && {
            name: {
                contains: search,
                mode: "insensitive",
            },
        }),
    };

    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            where,
            skip,
            take: limit,

            include: {
                user: true,
                kao: true,
                companies: {
                    include: {
                        employees: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.client.count({
            where,
        }),
    ]);

    return {
        clients,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

module.exports = {
    createUser,
    createClient,
    findKaoByUserId,
    getAllClients,
};
