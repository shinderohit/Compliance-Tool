const prisma = require("../../config/prisma");

const getStates = async (req, res) => {
    try {
        const states = await prisma.stateMaster.findMany({
            orderBy: {
                name: "asc",
            },
        });

        res.json(states);
    } catch (error) {
        console.log("getStates Error:", error);

        res.status(500).json({
            message: "Failed to fetch states",
        });
    }
};

const getLocations = async (req, res) => {
    try {
        const locations =
            await prisma.locationMaster.findMany({
                where: {
                    stateId: req.params.stateId,
                },

                orderBy: {
                    name: "asc",
                },
            });

        res.json(locations);
    } catch (error) {
        console.log("getLocations Error:", error);

        res.status(500).json({
            message: "Failed to fetch locations",
        });
    }
};

const getLawAreas = async (req, res) => {
    try {
        const lawAreas =
            await prisma.lawAreaMaster.findMany({
                orderBy: {
                    name: "asc",
                },
            });

        res.json(lawAreas);
    } catch (error) {
        console.log("getLawAreas Error:", error);

        res.status(500).json({
            message: "Failed to fetch law areas",
        });
    }
};

const getActRules = async (req, res) => {
    try {
        const actRules =
            await prisma.actRuleMaster.findMany({
                where: {
                    lawAreaId: req.params.lawAreaId,
                },

                orderBy: {
                    name: "asc",
                },
            });

        res.json(actRules);
    } catch (error) {
        console.log("getActRules Error:", error);

        res.status(500).json({
            message: "Failed to fetch act rules",
        });
    }
};

const getCompliances = async (req, res) => {
    try {
        const compliances =
            await prisma.complianceMasterDefinition.findMany({
                where: {
                    actRuleId: req.params.actRuleId,
                },

                orderBy: {
                    name: "asc",
                },
            });

        res.json(compliances);
    } catch (error) {
        console.log("getCompliances Error:", error);

        res.status(500).json({
            message: "Failed to fetch compliances",
        });
    }
};

const modelMap = {
    companies: "company",
    industries: "industryMaster",
    "business-types": "businessTypeMaster",
    departments: "departmentMaster",
    designations: "designationMaster",
    frequencies: "complianceFrequencyMaster",
    authorities: "authorityMaster",
    "regulatory-bodies": "regulatoryBodyMaster",
    "holiday-calendars": "holidayCalendar",
};

const getMasterList = async (req, res) => {
    try {
        const modelName = modelMap[req.params.type];

        if (!modelName || !prisma[modelName]) {
            return res.status(404).json({
                message: "Master data type not found",
            });
        }

        const data = await prisma[modelName].findMany({
            include:
                req.params.type === "holiday-calendars"
                    ? {
                        holidays: {
                            orderBy: {
                                date: "asc",
                            },
                        },
                    }
                    : req.params.type === "companies"
                        ? {
                            client: true,
                            industry: true,
                            businessType: true,
                        }
                        : undefined,
            orderBy:
                req.params.type === "holiday-calendars"
                    ? {
                        year: "desc",
                    }
                    : {
                        name: "asc",
                    },
        });

        res.json(data);
    } catch (error) {
        console.log("getMasterList Error:", error);

        res.status(500).json({
            message: "Failed to fetch master data",
        });
    }
};

const createMasterItem = async (req, res) => {
    try {
        if (req.params.type === "companies") {
            return res.status(400).json({
                message: "Company master creation is not supported through this endpoint.",
            });
        }

        const modelName = modelMap[req.params.type];

        if (!modelName || !prisma[modelName]) {
            return res.status(404).json({
                message: "Master data type not found",
            });
        }

        const payload = { ...req.body };

        if (req.params.type === "frequencies") {
            payload.code =
                payload.code ||
                String(payload.name || "")
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "_");
            payload.days = Number(payload.days || payload.description || 0);
            payload.description =
                req.body.description && Number.isNaN(Number(req.body.description))
                    ? req.body.description
                    : null;
        }

        const data = await prisma[modelName].create({
            data: payload,
        });

        res.status(201).json(data);
    } catch (error) {
        console.log("createMasterItem Error:", error);

        res.status(500).json({
            message: "Failed to create master data",
        });
    }
};

module.exports = {
    getStates,
    getLocations,
    getLawAreas,
    getActRules,
    getCompliances,
    getMasterList,
    createMasterItem,
};
