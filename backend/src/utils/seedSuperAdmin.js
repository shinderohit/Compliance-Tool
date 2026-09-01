require("dotenv").config();

const prisma = require("../config/prisma");

const bcrypt = require("bcryptjs");

const seedSuperAdmin = async () => {
    try {
        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: "admin@saas.com",
            },
        });

        if (existingAdmin) {
            console.log("Super Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 12);

        await prisma.user.create({
            data: {
                name: "Super Admin",
                email: "admin@saas.com",
                password: hashedPassword,
                role: "SUPER_ADMIN",
            },
        });

        console.log("Super Admin Created");

        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

seedSuperAdmin();