const { z } = require("zod");

const optionalText = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }

        return String(value);
    },
    z.string().trim().optional(),
);

const optionalNumberLike = z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.union([z.string(), z.number()]).optional(),
);

const complianceMasterBody = z.object({
    uin: optionalText,
    companyName: optionalText,
    state: optionalText,
    location: optionalText,
    lawArea: optionalText,
    actRule: optionalText,
    compliance: optionalText,
    complianceName: optionalText,
    gstNumber: optionalText,
    panNumber: optionalText,
    complianceType: optionalText,
    complianceScore: optionalNumberLike,
    status: optionalText,
    dueDate: optionalText,
    applicableDate: optionalText,
    expiryDate: optionalText,
    riskLevel: optionalText,
    risk: optionalText,
    assignedTo: optionalText,
    department: optionalText,
    priority: optionalText,
    frequency: optionalText,
    remarks: optionalText,
    branchId: optionalText,
    registrations: z.any().optional(),
    branches: z.any().optional(),
});

const createComplianceMasterSchema = z.object({
    body: complianceMasterBody.refine(
        (value) => value.compliance || value.complianceName || value.complianceType,
        {
            message: "Compliance name or type is required",
            path: ["compliance"],
        },
    ),
});

const bulkComplianceSchema = z.object({
    body: z.object({
        rows: z.array(complianceMasterBody).min(1, "At least one row is required"),
        complianceScore: optionalNumberLike,
        riskLevel: optionalText,
        documents: z.record(z.string(), z.any()).optional(),
        branches: z.array(z.record(z.string(), z.any())).optional(),
    }),
});

module.exports = {
    createComplianceMasterSchema,
    bulkComplianceSchema,
};
