const prisma = require("../../config/prisma");

const createUser = async (data) => {
    return await prisma.user.create({
        data,
    });
};

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            client: true,
            company: true,
        },
    });
};

const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: {
            id,
        },
    });
};

const updateUserPassword = async (id, password) => {
    return await prisma.user.update({
        where: {
            id,
        },
        data: {
            password,
        },
    });
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserPassword,
};
