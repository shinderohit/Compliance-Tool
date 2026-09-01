const resolveIndustryId = async (tx, industryValue) => {
    if (!industryValue) return undefined;

    const existingById = await tx.industryMaster.findUnique({
        where: { id: industryValue },
    });

    if (existingById) return existingById.id;

    const industry = await tx.industryMaster.upsert({
        where: { name: industryValue },
        update: {},
        create: {
            name: industryValue,
            code: industryValue.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, ""),
        },
    });

    return industry.id;
};

module.exports = {
    resolveIndustryId,
};
