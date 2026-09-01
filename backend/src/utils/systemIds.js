const pad = (value) => String(value + 1).padStart(6, "0");

const generateSystemId = async (tx, modelName, prefix) => {
    const count = await tx[modelName].count();
    return `${prefix}-${pad(count)}`;
};

module.exports = {
    generateSystemId,
    generateTemporaryPassword: () =>
        `Temp@${Math.random().toString(36).slice(2, 8).toUpperCase()}${new Date().getFullYear()}`,
};
