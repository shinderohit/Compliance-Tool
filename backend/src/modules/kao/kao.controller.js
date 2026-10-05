const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const slugify = require("../../utils/slugify");
const logAudit = require("../../utils/auditLogger");
const storageService = require("../../services/storage/storage.service");
const { generateSystemId, generateTemporaryPassword } = require("../../utils/systemIds");
const { resolveIndustryId } = require("../../utils/onboardingHelpers");
const {
    sendClientCreatedEmails,
    sendCompanyCreatedEmails,
} = require("../../utils/mailService");

const {
    findKaoByUserId,
    getAllClients,
} = require("./kao.service");

const createClientController = async (req, res) => {
    try {
        const {
            companyName,
            companyNameAsPerGstCertificate,
            name,
            email,
            seDetails,
            natureOfWork,
            industryId,
            appropriateGovernment,
            serviceModel,
            state,
            city,
            location,
            pincode,
            panNumber,
            gstNumber,
            pfNumber,
            esicNumber,
            ptNumber,
            lwfNumber,
        } = req.body;

        if (!companyName || !companyNameAsPerGstCertificate || !name || !email || !seDetails || !natureOfWork || !industryId || !appropriateGovernment) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const gstCertificateFile = req.files?.gstCertificate?.[0];
        const seCertificateFile = req.files?.seCertificate?.[0];
        const companyLogoFile = req.files?.companyLogo?.[0];
        const requiredFiles = ["panCertificate", "gstCertificate", "seCertificate", "pfCertificate", "esicCertificate", "ptCertificate", "lwfCertificate"];
        const missingFile = requiredFiles.find((field) => !req.files?.[field]?.[0]);

        if (missingFile) {
            return res.status(400).json({
                success: false,
                message: "All statutory document uploads are required",
            });
        }

        const slug = slugify(companyName);

        const kao = await prisma.kao.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const existingClient = await prisma.client.findUnique({
            where: {
                slug,
            },
        });

        if (existingClient) {
            return res.status(400).json({
                success: false,
                message: "Client already exists",
            });
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
        const gstCertificate = storageService.getFileMetadata(gstCertificateFile);
        const seCertificate = storageService.getFileMetadata(seCertificateFile);
        const logo = companyLogoFile ? storageService.getFileMetadata(companyLogoFile) : null;
        const fileData = {};
        [...requiredFiles, "bulkUpload"].forEach((field) => {
            const file = req.files?.[field]?.[0];
            if (file) fileData[field] = storageService.getFileMetadata(file);
        });

        const client = await prisma.$transaction(async (tx) => {
            const resolvedIndustryId = await resolveIndustryId(tx, industryId);
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    temporaryPassword,
                    role: "CLIENT",
                    isActive: false,
                },
            });

            return tx.client.create({
                data: {
                    clientCode: await generateSystemId(tx, "client", "CLI"),
                    name: companyName,
                    slug,
                    email,
                    userId: user.id,
                    kaoId: kao.id,
                    serviceModel: serviceModel || "SAAS",
                    logo,
                    state,
                    city,
                    location,
                    pincode,
                    panNumber,
                    gstNumber,
                    companyNameAsPerGstCertificate,
                    gstCertificate,
                    seDetails,
                    seCertificate,
                    pfNumber,
                    esicNumber,
                    ptNumber,
                    lwfNumber,
                    ...fileData,
                    natureOfWork,
                    industryId: resolvedIndustryId,
                    appropriateGovernment,
                },
            });
        });

        const loginUrl = `/client/${slug}/login`;
        let mailResult = null;

        try {
            mailResult = await sendClientCreatedEmails({
                client,
                kao,
                loginUrl,
                password: temporaryPassword,
            });
        } catch (mailError) {
            console.log(mailError);
            mailResult = {
                skipped: true,
                reason: mailError.message,
            };
        }

        await logAudit({
            req,
            action: "CLIENT_CREATED",
            entityType: "Client",
            entityId: client.id,
            changes: {
                name: client.name,
                email: client.email,
                kaoId: kao.id,
                industryId,
                appropriateGovernment,
                mail: mailResult?.skipped ? `Skipped: ${mailResult.reason}` : "Sent",
            },
            reason: "KAO created client",
        });

        return res.status(201).json({
            success: true,
            client,
            loginUrl,
            loginName: email,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const createCompanyController = async (req, res) => {
    try {
        const {
            clientId,
            companyName,
            companyNameAsPerGstCertificate,
            name,
            email,
            seDetails,
            natureOfWork,
            industryId,
            appropriateGovernment,
            branchCode,
            state,
            city,
            location,
            pincode,
            panNumber,
            gstNumber,
            pfNumber,
            esicNumber,
            ptNumber,
            lwfNumber,
        } = req.body;

        if (
            !clientId ||
            !companyName ||
            !companyNameAsPerGstCertificate ||
            !name ||
            !email ||
            !seDetails ||
            !natureOfWork ||
            !industryId ||
            !appropriateGovernment
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const gstCertificateFile = req.files?.gstCertificate?.[0];
        const seCertificateFile = req.files?.seCertificate?.[0];
        const companyLogoFile = req.files?.companyLogo?.[0];
        const requiredFiles = ["panCertificate", "gstCertificate", "seCertificate", "pfCertificate", "esicCertificate", "ptCertificate", "lwfCertificate"];
        const missingFile = requiredFiles.find((field) => !req.files?.[field]?.[0]);

        if (missingFile) {
            return res.status(400).json({
                success: false,
                message: "All statutory document uploads are required",
            });
        }

        const kao = await prisma.kao.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                kaoId: kao.id,
            },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found or not owned by this KAO",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const slug = slugify(companyName);

        const existingCompany = await prisma.company.findUnique({
            where: {
                slug,
            },
        });

        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: "Company already exists",
            });
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
        const gstCertificate = storageService.getFileMetadata(gstCertificateFile);
        const seCertificate = storageService.getFileMetadata(seCertificateFile);
        const logo = companyLogoFile ? storageService.getFileMetadata(companyLogoFile) : null;
        const fileData = {};
        [...requiredFiles, "bulkUpload"].forEach((field) => {
            const file = req.files?.[field]?.[0];
            if (file) fileData[field] = storageService.getFileMetadata(file);
        });

        const company = await prisma.$transaction(async (tx) => {
            const resolvedIndustryId = await resolveIndustryId(tx, industryId);
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    temporaryPassword,
                    role: "COMPANY",
                    isActive: false,
                },
            });

            return tx.company.create({
                data: {
                    companyCode: await generateSystemId(tx, "company", "CMP"),
                    branchCode,
                    name: companyName,
                    slug,
                    email,
                    userId: user.id,
                    clientId: client.id,
                    logo,
                    state,
                    city,
                    location,
                    pincode,
                    pan: panNumber,
                    gst: gstNumber,
                    pf: pfNumber,
                    esic: esicNumber,
                    pt: ptNumber,
                    lwf: lwfNumber,
                    companyNameAsPerGstCertificate,
                    gstCertificate,
                    seDetails,
                    seCertificate,
                    ...fileData,
                    natureOfWork,
                    industryId: resolvedIndustryId,
                    appropriateGovernment,
                },
            });
        });

        const loginUrl = `/company/${slug}/login`;
        let mailResult = null;

        try {
            mailResult = await sendCompanyCreatedEmails({
                company,
                kao,
                loginUrl,
                password: temporaryPassword,
            });
        } catch (mailError) {
            console.log(mailError);
            mailResult = {
                skipped: true,
                reason: mailError.message,
            };
        }

        await logAudit({
            req,
            action: "COMPANY_CREATED",
            entityType: "Company",
            entityId: company.id,
            changes: {
                name: company.name,
                email: company.email,
                clientId: client.id,
                industryId,
                appropriateGovernment,
                mail: mailResult?.skipped ? `Skipped: ${mailResult.reason}` : "Sent",
            },
            reason: "KAO created company",
        });

        return res.status(201).json({
            success: true,
            company,
            loginUrl,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getAllClientsController = async (
    req,
    res
) => {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
        } = req.query;

        const kao = await findKaoByUserId(
            req.user.id
        );

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const result = await getAllClients({
            kaoId: kao.id,
            search,
            page: Number(page),
            limit: Number(limit),
        });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getKaoDashboardController = async (req, res) => {
    try {
        const kao = await prisma.kao.findUnique({
            where: {
                userId: req.user.id,
            },
            include: {
                clients: {
                    include: {
                        companies: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 10,
                },
            },
        });

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const totalCompanies = kao.clients.reduce(
            (count, client) => count + client.companies.length,
            0
        );

        return res.status(200).json({
            success: true,
            kao: {
                id: kao.id,
                name: kao.name,
                email: kao.email,
                slug: kao.slug,
            },
            stats: {
                totalClients: kao.clients.length,
                totalCompanies,
                totalUploads: 0,
            },
            clients: kao.clients.map((client) => ({
                id: client.id,
                name: client.name,
                email: client.email,
                slug: client.slug,
                totalCompanies: client.companies.length,
                loginUrl: `/client/${client.slug}/login`,
            })),
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getKaoCompanies = async (req, res) => {
    try {
        const kao = await prisma.kao.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const companies = await prisma.company.findMany({
            where: {
                client: {
                    kaoId: kao.id,
                },
            },

            include: {
                client: {
                    include: {
                        kao: true,
                    },
                },

                uploads: true,
                employees: true,
                user: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedCompanies = companies.map((company) => ({
            ...company,

            uploadCount: company.uploads.length,
            totalEmployees: company.employees.length,
            isActive: company.user?.isActive ?? true,

            complianceScore:
                Math.floor(Math.random() * 30) + 70,

            status:
                company.uploads.length > 0
                    ? "Active"
                    : "Pending",
        }));

        res.status(200).json({
            success: true,
            companies: formattedCompanies,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const updateKaoClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const kao = await findKaoByUserId(req.user.id);

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const client = await prisma.client.findFirst({
            where: {
                id,
                kaoId: kao.id,
            },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser && existingUser.id !== client.userId) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        const userData = {};
        if (name) userData.name = name;
        if (email) userData.email = email;

        const clientData = {};
        if (name) {
            const slug = slugify(name);
            const existingClient = await prisma.client.findUnique({
                where: { slug },
            });

            if (existingClient && existingClient.id !== id) {
                return res.status(400).json({
                    success: false,
                    message: "Client already exists",
                });
            }

            clientData.name = name;
            clientData.slug = slug;
        }
        if (email) clientData.email = email;

        const updatedClient = await prisma.$transaction(async (tx) => {
            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: client.userId },
                    data: userData,
                });
            }

            return tx.client.update({
                where: { id },
                data: clientData,
                include: {
                    user: true,
                    companies: true,
                },
            });
        });

        await logAudit({
            req,
            action: "CLIENT_UPDATED",
            entityType: "Client",
            entityId: updatedClient.id,
            changes: {
                before: {
                    name: client.name,
                    email: client.email,
                    slug: client.slug,
                },
                after: {
                    name: updatedClient.name,
                    email: updatedClient.email,
                    slug: updatedClient.slug,
                },
            },
            reason: "KAO updated client",
        });

        return res.status(200).json({
            success: true,
            client: updatedClient,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const deleteKaoClient = async (req, res) => {
    try {
        const { id } = req.params;
        const kao = await findKaoByUserId(req.user.id);

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const client = await prisma.client.findFirst({
            where: {
                id,
                kaoId: kao.id,
            },
            include: {
                companies: true,
            },
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found",
            });
        }

        if ((client.companies || []).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete client with existing companies",
            });
        }

        await prisma.$transaction([
            prisma.client.delete({ where: { id } }),
            prisma.user.delete({ where: { id: client.userId } }),
        ]);

        await logAudit({
            req,
            action: "CLIENT_DELETED",
            entityType: "Client",
            entityId: id,
            changes: {
                name: client.name,
                email: client.email,
                kaoId: kao.id,
            },
            reason: "KAO deleted client",
        });

        return res.status(200).json({
            success: true,
            message: "Client deleted",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = {
    createClientController,
    createCompanyController,
    getAllClientsController,
    getKaoDashboardController,
    getKaoCompanies,
    updateKaoClient,
    deleteKaoClient,
};
