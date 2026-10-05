const hashPassword = require("../../utils/hashPassword");
const prisma = require("../../config/prisma");
const slugify = require("../../utils/slugify");
const { generateSystemId } = require("../../utils/systemIds");

const comparePassword = require("../../utils/comparePassword");

const generateToken = require("../../utils/generateToken");

const {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserPassword,
} = require("./auth.service");

/* REGISTER */

const register = async (
    req,
    res
) => {
    try {
        const {
            name,
            email,
            password,
            role,
        } = req.body;

        /* CHECK EXISTING USER */

        const existingUser =
            await findUserByEmail(
                email
            );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:
                    "User already exists",
            });
        }

        /* HASH PASSWORD */

        const hashedPassword =
            await hashPassword(
                password
            );

        /* CREATE USER */

        const user = await createUser({
            name,
            email,
            password: hashedPassword,
            temporaryPassword: password,
            role,
        });

        return res.status(201).json({
            success: true,
            message:
                "User registered successfully",

            user,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

/* LOGIN */

const loginController = async (
    req,
    res
) => {
    try {
        const { email, password } =
            req.body;

        const normalizedEmail =
            email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        /* FIND USER */

        const user =
            await findUserByEmail(
                normalizedEmail
            );

        if (!user) {
            return res.status(400).json({
                success: false,
                message:
                    "Data not found",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Login is pending Super Admin approval",
            });
        }

        /* CHECK PASSWORD */

        const isMatch =
            await comparePassword(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "Data not found",
            });
        }

        /* GENERATE TOKEN */

        const token =
            generateToken(user);

        /* RESPONSE */

        return res.status(200).json({
            success: true,

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                contactNumber: user.contactNumber,
                role: user.role,
                serviceModel: user.client?.serviceModel,
                logo: user.client?.logo || user.company?.logo || null,
            },
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                kao: true,
                client: { include: { kao: true } },
                company: { include: { client: { include: { kao: true } } } },
            },
        });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.json({
            success: true,
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                contactNumber: user.contactNumber || user.kao?.contactNumber || "",
                role: user.role,
                temporaryPassword: user.temporaryPassword || null,
                entity: user.kao || user.client || user.company || null,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, contactNumber } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name ? { name } : {}),
                contactNumber,
            },
        });

        if (req.user.role === "KAO") {
            await prisma.kao.updateMany({
                where: { userId: req.user.id },
                data: { ...(contactNumber !== undefined ? { contactNumber } : {}) },
            });
        }

        return res.json({
            success: true,
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                contactNumber: user.contactNumber,
                role: user.role,
                temporaryPassword: user.temporaryPassword,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};

const createLogin = async (req, res) => {
    try {
        const { name, email, password, contactNumber, role, kaoId, clientId } = req.body;
        const creatorRole = req.user.role;
        const allowed = {
            SUPER_ADMIN: ["KAO", "CLIENT", "COMPANY"],
            KAO: ["CLIENT", "COMPANY"],
            CLIENT: ["COMPANY"],
        };

        if (!allowed[creatorRole]?.includes(role)) {
            return res.status(403).json({ success: false, message: "Role cannot create this login" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

        const hashedPassword = await hashPassword(password);
        const uniqueSlug = `${slugify(name)}-${Date.now()}`;

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email: normalizedEmail,
                    password: hashedPassword,
                    temporaryPassword: password,
                    contactNumber,
                    role,
                    isActive: false,
                },
            });

            if (role === "KAO") {
                const kao = await tx.kao.create({
                    data: {
                        kaoCode: await generateSystemId(tx, "kao", "KAO"),
                        name,
                        slug: uniqueSlug,
                        email: normalizedEmail,
                        contactNumber,
                        userId: user.id,
                        createdById: req.user.id,
                    },
                });
                return { user, entity: kao, loginUrl: `/kao/${kao.slug}/login` };
            }

            let resolvedKaoId = kaoId;
            if (creatorRole === "KAO") {
                const kao = await tx.kao.findUnique({ where: { userId: req.user.id } });
                resolvedKaoId = kao?.id;
            }

            if (role === "CLIENT") {
                if (!resolvedKaoId) throw new Error("KAO is required for client login");
                const client = await tx.client.create({
                    data: {
                        clientCode: await generateSystemId(tx, "client", "CLI"),
                        name,
                        slug: uniqueSlug,
                        email: normalizedEmail,
                        userId: user.id,
                        kaoId: resolvedKaoId,
                        serviceModel: "SAAS",
                        companyNameAsPerGstCertificate: name,
                        seDetails: "Pending",
                        natureOfWork: "Pending",
                        appropriateGovernment: "CENTRAL",
                    },
                });
                return { user, entity: client, loginUrl: `/client/${client.slug}/login` };
            }

            let resolvedClientId = clientId;
            if (creatorRole === "CLIENT") {
                const client = await tx.client.findUnique({ where: { userId: req.user.id } });
                resolvedClientId = client?.id;
            }

            if (creatorRole === "KAO" && resolvedClientId) {
                const ownsClient = await tx.client.findFirst({
                    where: { id: resolvedClientId, kaoId: resolvedKaoId },
                });
                if (!ownsClient) throw new Error("Client not owned by this KAO");
            }

            if (!resolvedClientId) throw new Error("Client is required for company/branch login");
            const company = await tx.company.create({
                data: {
                    companyCode: await generateSystemId(tx, "company", "CMP"),
                    name,
                    slug: uniqueSlug,
                    email: normalizedEmail,
                    userId: user.id,
                    clientId: resolvedClientId,
                    companyNameAsPerGstCertificate: name,
                    seDetails: "Pending",
                    natureOfWork: "Pending",
                    appropriateGovernment: "CENTRAL",
                },
            });
            return { user, entity: company, loginUrl: `/company/${company.slug}/login` };
        });

        return res.status(201).json({
            success: true,
            message: "Login created and sent for Super Admin approval",
            data: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
                contactNumber: result.user.contactNumber,
                temporaryPassword: result.user.temporaryPassword,
                entity: result.entity,
                loginUrl: result.loginUrl,
                loginName: result.user.email,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: error.message || "Failed to create login" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required",
            });
        }

        const normalizedEmail = email?.trim().toLowerCase();

        const user = await findUserByEmail(normalizedEmail);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const hashedPassword = await hashPassword(newPassword);

        await updateUserPassword(user.id, hashedPassword);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login.",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Password reset failed",
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }

        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await comparePassword(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const hashedPassword = await hashPassword(newPassword);

        await updateUserPassword(user.id, hashedPassword);

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Unable to change password",
        });
    }
};

module.exports = {
    register,
    loginController,
    forgotPassword,
    changePassword,
    getProfile,
    updateProfile,
    createLogin,
};
