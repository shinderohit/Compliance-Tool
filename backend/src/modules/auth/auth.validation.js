const { z } = require("zod");

const email = z.string().trim().email("Valid email is required");
const password = z.string().min(1, "Password is required");

const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Name is required"),
        email,
        password,
        role: z.enum(["SUPER_ADMIN", "KAO", "CLIENT", "COMPANY"]),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email,
        password,
    }),
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email,
        newPassword: password,
    }),
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: password,
        newPassword: password,
    }),
});

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Name is required").optional(),
        contactNumber: z.string().trim().optional(),
    }),
});

const createLoginSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Name is required"),
        email,
        password,
        contactNumber: z.string().trim().optional(),
        role: z.enum(["KAO", "CLIENT", "COMPANY"]),
        kaoId: z.string().trim().optional(),
        clientId: z.string().trim().optional(),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    changePasswordSchema,
    updateProfileSchema,
    createLoginSchema,
};
