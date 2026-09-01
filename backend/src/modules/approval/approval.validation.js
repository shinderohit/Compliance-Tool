const { z } = require("zod");

const idParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Compliance id is required"),
    }),
});

const rejectApprovalSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Compliance id is required"),
    }),
    body: z.object({
        reason: z.string().trim().max(1000).optional(),
    }),
});

module.exports = {
    idParamSchema,
    rejectApprovalSchema,
};
