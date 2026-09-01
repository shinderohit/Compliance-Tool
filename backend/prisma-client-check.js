const prisma = require("./src/config/prisma");

prisma.complianceMaster
    .count()
    .then((count) => {
        console.log(`count ${count}`);
        return prisma.$disconnect();
    })
    .catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
