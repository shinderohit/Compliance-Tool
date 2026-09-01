const bcrypt = require("bcryptjs");

const { PrismaClient } =
    require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const existingUser =
        await prisma.user.findUnique({
            where: {
                email: "admin@saas.com",
            },
        });

    if (existingUser) {
        console.log(
            "Super Admin already exists"
        );

        return;
    }

    const hashedPassword =
        await bcrypt.hash("Admin@123", 12);

    await prisma.user.create({
        data: {
            name: "Super Admin",

            email: "admin@saas.com",

            password: hashedPassword,

            role: "SUPER_ADMIN",
        },
    });

    console.log(
        "Super Admin Created Successfully"
    );
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
