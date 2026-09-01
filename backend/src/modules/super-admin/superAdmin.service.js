const prisma = require("../../config/prisma");

const createKao = async (data) => {
    return await prisma.kao.create({
        data,
    });
};

const createUser = async (data) => {
    return await prisma.user.create({
        data,
    });
};

const getAllKaos = async ({
    search,
    page,
    limit,
}) => {
    const skip = (page - 1) * limit;

    const where = search
        ? {
            organizationName: {
                contains: search,
                mode: "insensitive",
            },
        }
        : {};

    const [kaos, total] = await Promise.all([
        prisma.kao.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: true,
                clients: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.kao.count({ where }),
    ]);

    return {
        kaos,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

module.exports = {
    createKao,
    createUser,
    getAllKaos,
};