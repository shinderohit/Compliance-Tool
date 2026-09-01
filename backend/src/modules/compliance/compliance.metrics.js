const COMPLETED_STATUSES = new Set([
    "completed",
    "complied",
    "not applicable",
]);

const normalizeRisk = (risk) => {
    const value = String(risk || "").toLowerCase();
    if (value === "high") return "High";
    if (value === "medium") return "Medium";
    if (value === "low") return "Low";
    return null;
};

const startOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getEffectiveStatus = (item, today = startOfToday()) => {
    const status = String(item.status || "").trim();
    const normalizedStatus = status.toLowerCase();

    if (COMPLETED_STATUSES.has(normalizedStatus)) return "Completed";
    if (normalizedStatus === "overdue") return "Overdue";

    if (item.dueDate) {
        const dueDate = new Date(item.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (!Number.isNaN(dueDate.getTime()) && dueDate < today) {
            return "Overdue";
        }
    }

    return "Pending";
};

const getEffectiveRisk = (item, today = startOfToday()) => {
    const storedRisk = normalizeRisk(item.risk || item.riskLevel);
    if (storedRisk) return storedRisk;

    if (getEffectiveStatus(item, today) === "Overdue") return "High";

    if (typeof item.complianceScore === "number") {
        if (item.complianceScore <= 40) return "High";
        if (item.complianceScore <= 70) return "Medium";
    }

    if (item.dueDate) {
        const dueDate = new Date(item.dueDate);
        const daysRemaining = Math.ceil(
            (dueDate - today) / (1000 * 60 * 60 * 24),
        );
        if (daysRemaining <= 30) return "Medium";
    }

    return "Low";
};

module.exports = {
    getEffectiveRisk,
    getEffectiveStatus,
    startOfToday,
};
