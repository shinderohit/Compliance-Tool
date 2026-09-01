const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const slugify = require("../../utils/slugify");
const logAudit = require("../../utils/auditLogger");
const storageService = require("../../services/storage/storage.service");
const { generateSystemId, generateTemporaryPassword } = require("../../utils/systemIds");
const { resolveIndustryId } = require("../../utils/onboardingHelpers");
const { sendClientCreatedEmails } = require("../../utils/mailService");

const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const buildMonthlySeries = (items, valueKey) => {
    const currentYear = new Date().getFullYear();
    const months = monthLabels.map((month) => ({
        month,
        [valueKey]: 0,
    }));

    items.forEach((item) => {
        const createdAt = new Date(item.createdAt);

        if (createdAt.getFullYear() === currentYear) {
            months[createdAt.getMonth()][valueKey] += 1;
        }
    });

    return months;
};

const createKaoController = async (req, res) => {
    try {
        const { organizationName, name, email, contactNumber } = req.body;

        if (!organizationName || !name || !email) {
            return res.status(400).json({
                success: false,
                message: "organizationName, name and email are required",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const slug = slugify(organizationName);

        const existingKao = await prisma.kao.findUnique({
            where: { slug },
        });

        if (existingKao) {
            return res.status(400).json({
                success: false,
                message: "Organization already exists",
            });
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    temporaryPassword,
                    contactNumber,
                    role: "KAO",
                    isActive: false,
                },
            });

            const kao = await tx.kao.create({
                data: {
                    kaoCode: await generateSystemId(tx, "kao", "KAO"),
                    name: organizationName,
                    slug,
                    email,
                    contactNumber,
                    userId: user.id,
                    createdById: req.user.id,
                },
            });

            return kao;
        });

        await logAudit({
            req,
            action: "KAO_CREATED",
            entityType: "KAO",
            entityId: result.id,
            changes: {
                name: result.name,
                email: result.email,
            },
            reason: "Super admin created KAO",
        });

        return res.status(201).json({
            success: true,
            message: "KAO created successfully",
            data: {
                id: result.id,
                kaoCode: result.kaoCode,
                name: result.name,
                email: result.email,
                slug: result.slug,
                loginUrl: `/kao/${result.slug}/login`,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const createClientController = async (req, res) => {
    try {
        const {
            companyName,
            companyNameAsPerGstCertificate,
            name,
            email,
            kaoId,
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

        if (!companyName || !companyNameAsPerGstCertificate || !name || !email || !kaoId || !seDetails || !natureOfWork || !industryId || !appropriateGovernment) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const gstCertificateFile = req.files?.gstCertificate?.[0];
        const seCertificateFile = req.files?.seCertificate?.[0];
        const panCertificateFile = req.files?.panCertificate?.[0];
        const pfCertificateFile = req.files?.pfCertificate?.[0];
        const esicCertificateFile = req.files?.esicCertificate?.[0];
        const ptCertificateFile = req.files?.ptCertificate?.[0];
        const lwfCertificateFile = req.files?.lwfCertificate?.[0];
        const bulkUploadFile = req.files?.bulkUpload?.[0];

        if (!gstCertificateFile || !seCertificateFile || !panCertificateFile || !pfCertificateFile || !esicCertificateFile || !ptCertificateFile || !lwfCertificateFile) {
            return res.status(400).json({
                success: false,
                message: "PAN, GST, S&E, PF, ESIC, PT, and LWF document uploads are required",
            });
        }

        const kao = await prisma.kao.findUnique({
            where: { id: kaoId },
        });

        if (!kao) {
            return res.status(404).json({
                success: false,
                message: "KAO not found",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const slug = slugify(companyName);

        const existingClient = await prisma.client.findUnique({
            where: { slug },
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
        const panCertificate = storageService.getFileMetadata(panCertificateFile);
        const pfCertificate = storageService.getFileMetadata(pfCertificateFile);
        const esicCertificate = storageService.getFileMetadata(esicCertificateFile);
        const ptCertificate = storageService.getFileMetadata(ptCertificateFile);
        const lwfCertificate = storageService.getFileMetadata(lwfCertificateFile);
        const bulkUpload = bulkUploadFile ? storageService.getFileMetadata(bulkUploadFile) : null;

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
                    state,
                    city,
                    location,
                    pincode,
                    panNumber,
                    panCertificate,
                    gstNumber,
                    companyNameAsPerGstCertificate,
                    gstCertificate,
                    seDetails,
                    seCertificate,
                    pfNumber,
                    pfCertificate,
                    esicNumber,
                    esicCertificate,
                    ptNumber,
                    ptCertificate,
                    lwfNumber,
                    lwfCertificate,
                    bulkUpload,
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
                serviceModel: serviceModel || "SAAS",
                mail: mailResult?.skipped ? `Skipped: ${mailResult.reason}` : "Sent",
            },
            reason: "Super admin created client",
        });

        return res.status(201).json({
            success: true,
            message: "Client created successfully",
            client,
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

        if (!clientId || !companyName || !companyNameAsPerGstCertificate || !name || !email || !seDetails || !natureOfWork || !industryId || !appropriateGovernment) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const requiredFiles = ["panCertificate", "gstCertificate", "seCertificate", "pfCertificate", "esicCertificate", "ptCertificate", "lwfCertificate"];
        const missingFile = requiredFiles.find((field) => !req.files?.[field]?.[0]);
        if (missingFile) {
            return res.status(400).json({ success: false, message: "All statutory document uploads are required" });
        }

        const client = await prisma.client.findUnique({ where: { id: clientId }, include: { kao: true } });
        if (!client) return res.status(404).json({ success: false, message: "Client not found" });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

        const slug = slugify(companyName);
        const existingCompany = await prisma.company.findUnique({ where: { slug } });
        if (existingCompany) return res.status(400).json({ success: false, message: "Company already exists" });

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
        const fileData = {};
        [...requiredFiles, "bulkUpload"].forEach((field) => {
            const file = req.files?.[field]?.[0];
            if (file) fileData[field] = storageService.getFileMetadata(file);
        });

        const company = await prisma.$transaction(async (tx) => {
            const resolvedIndustryId = await resolveIndustryId(tx, industryId);
            const user = await tx.user.create({
                data: { name, email, password: hashedPassword, temporaryPassword, role: "COMPANY", isActive: false },
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
                    seDetails,
                    natureOfWork,
                    industryId: resolvedIndustryId,
                    appropriateGovernment,
                    ...fileData,
                },
            });
        });

        await logAudit({
            req,
            action: "COMPANY_CREATED",
            entityType: "Company",
            entityId: company.id,
            companyId: company.id,
            changes: { name: company.name, email: company.email, clientId: client.id, industryId, appropriateGovernment },
            reason: "Super admin created company",
        });

        return res.status(201).json({ success: true, company, loginUrl: `/company/${slug}/login` });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getAllKaosController = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : {};

        const [total, kaos] = await Promise.all([
            prisma.kao.count({ where }),
            prisma.kao.findMany({
                where,
                include: {
                    clients: {
                        include: {
                            companies: {
                                include: {
                                    employees: true,
                                },
                            },
                        },
                    },
                    user: true,
                },
                skip,
                take: Number(limit),
                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        const data = kaos.map((kao) => ({
            id: kao.id,
            name: kao.name,
            email: kao.email,
            slug: kao.slug,
            totalClients: kao.clients.length,
            totalCompanies: kao.clients.reduce((count, client) => count + client.companies.length, 0),
            totalEmployees: kao.clients.reduce(
                (count, client) =>
                    count + client.companies.reduce((sum, company) => sum + (company.employees?.length || 0), 0),
                0,
            ),
            loginUrl: `/kao/${kao.slug}/login`,
            isActive: kao.user?.isActive ?? true,
            createdAt: kao.createdAt,
        }));

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
            data,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getAllClientsController = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : {};

        const [total, clients] = await Promise.all([
            prisma.client.count({ where }),
            prisma.client.findMany({
                where,
                include: {
                    kao: true,
                    companies: {
                        include: {
                            employees: true,
                        },
                    },
                    user: true,
                },
                skip,
                take: Number(limit),
                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
            data: clients.map((client) => ({
                id: client.id,
                clientCode: client.clientCode,
                name: client.name,
                email: client.email,
                slug: client.slug,
                kaoName: client.kao?.name,
                serviceModel: client.serviceModel,
                approvalStatus: client.approvalStatus,
                appropriateGovernment: client.appropriateGovernment,
                industryId: client.industryId,
                state: client.state,
                city: client.city,
                location: client.location,
                pincode: client.pincode,
                panNumber: client.panNumber,
                companyNameAsPerGstCertificate: client.companyNameAsPerGstCertificate,
                gstNumber: client.gstNumber,
                seDetails: client.seDetails,
                pfNumber: client.pfNumber,
                esicNumber: client.esicNumber,
                ptNumber: client.ptNumber,
                lwfNumber: client.lwfNumber,
                totalCompanies: client.companies.length,
                totalEmployees: client.companies.reduce((count, company) => count + (company.employees?.length || 0), 0),
                loginUrl: `/client/${client.slug}/login`,
                isActive: client.user?.isActive ?? true,
                createdAt: client.createdAt,
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

const getAllCompaniesController = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : {};

        const [total, companies] = await Promise.all([
            prisma.company.count({ where }),
            prisma.company.findMany({
                where,
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
                skip,
                take: Number(limit),
                orderBy: {
                    createdAt: "desc",
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
            data: companies.map((company) => ({
                id: company.id,
                companyCode: company.companyCode,
                branchCode: company.branchCode,
                name: company.name,
                email: company.email,
                slug: company.slug,
                clientName: company.client?.name,
                kaoName: company.client?.kao?.name,
                approvalStatus: company.approvalStatus,
                appropriateGovernment: company.appropriateGovernment,
                industryId: company.industryId,
                state: company.state,
                city: company.city,
                location: company.location,
                pincode: company.pincode,
                pan: company.pan,
                companyNameAsPerGstCertificate: company.companyNameAsPerGstCertificate,
                gst: company.gst,
                seDetails: company.seDetails,
                pf: company.pf,
                esic: company.esic,
                pt: company.pt,
                lwf: company.lwf,
                totalUploads: company.uploads.length,
                totalEmployees: company.employees.length,
                loginUrl: `/company/${company.slug}/login`,
                isActive: company.user?.isActive ?? true,
                createdAt: company.createdAt,
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

const getDashboardData = async (req, res) => {
    try {
        const [
            totalKAOs,
            totalClients,
            totalCompanies,
            totalUploads,
            kaos,
            clients,
            companies,
            uploads,
        ] = await Promise.all([
            prisma.kao.count(),
            prisma.client.count(),
            prisma.company.count(),
            prisma.complianceUpload.count(),
            prisma.kao.findMany({
                include: {
                    clients: {
                        include: {
                            companies: {
                                include: {
                                    employees: true,
                                },
                            },
                        },
                    },
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            }),
            prisma.client.findMany({
                include: {
                    kao: true,
                    companies: {
                        include: {
                            employees: true,
                        },
                    },
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            }),
            prisma.company.findMany({
                include: {
                    client: {
                        include: {
                            kao: true,
                        },
                    },
                    uploads: true,
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            }),
            prisma.complianceUpload.findMany({
                select: {
                    createdAt: true,
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalKAOs,
                totalClients,
                totalCompanies,
                totalUploads,
            },
            charts: {
                monthlyUploads: buildMonthlySeries(uploads, "uploads"),
                clientGrowth: buildMonthlySeries(clients, "clients"),
                companyGrowth: buildMonthlySeries(companies, "companies"),
            },
            tables: {
                kaos: kaos.map((kao) => ({
                    id: kao.id,
                    name: kao.name,
                    email: kao.email,
                    slug: kao.slug,
                    totalClients: kao.clients.length,
                    totalCompanies: kao.clients.reduce((count, client) => count + client.companies.length, 0),
                    loginUrl: `/kao/${kao.slug}/login`,
                    isActive: kao.user?.isActive ?? true,
                })),
                clients: clients.map((client) => ({
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    slug: client.slug,
                    kaoName: client.kao?.name,
                    totalCompanies: client.companies.length,
                    loginUrl: `/client/${client.slug}/login`,
                    isActive: client.user?.isActive ?? true,
                })),
                companies: companies.map((company) => ({
                    id: company.id,
                    name: company.name,
                    email: company.email,
                    slug: company.slug,
                    clientName: company.client?.name,
                    kaoName: company.client?.kao?.name,
                    totalUploads: company.uploads.length,
                    loginUrl: `/company/${company.slug}/login`,
                    isActive: company.user?.isActive ?? true,
                })),
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

const getKaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const kao = await prisma.kao.findUnique({
            where: { id },
            include: {
                clients: { include: { companies: true } },
                user: true,
            },
        });

        if (!kao) {
            return res.status(404).json({ success: false, message: "KAO not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: kao.id,
                kaoCode: kao.kaoCode,
                name: kao.name,
                email: kao.email,
                slug: kao.slug,
                approvalStatus: kao.approvalStatus,
                totalClients: kao.clients.length,
                totalCompanies: kao.clients.reduce((count, client) => count + client.companies.length, 0),
                isActive: kao.user?.isActive ?? true,
                loginUrl: `/kao/${kao.slug}/login`,
                createdAt: kao.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const toggleKaoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const kao = await prisma.kao.findUnique({ where: { id } });
        if (!kao) return res.status(404).json({ success: false, message: "KAO not found" });

        const user = await prisma.user.update({
            where: { id: kao.userId },
            data: { isActive: Boolean(isActive) },
        });

        await logAudit({
            req,
            action: "KAO_STATUS_CHANGED",
            entityType: "KAO",
            entityId: kao.id,
            changes: {
                isActive: user.isActive,
            },
            reason: "Super admin changed KAO status",
        });

        return res.status(200).json({ success: true, data: { isActive: user.isActive } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const updateKao = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationName, name, email } = req.body;

        const kao = await prisma.kao.findUnique({ where: { id } });
        if (!kao) return res.status(404).json({ success: false, message: "KAO not found" });

        const userId = kao.userId;

        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ success: false, message: "Email already exists" });
            }
        }

        const userData = {};
        if (name) userData.name = name;
        if (email) userData.email = email;

        if (Object.keys(userData).length > 0) {
            await prisma.user.update({ where: { id: userId }, data: userData });
        }

        const kaoData = {};
        if (organizationName) {
            const slug = slugify(organizationName);
            const existing = await prisma.kao.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                return res.status(400).json({ success: false, message: "Organization slug already exists" });
            }
            kaoData.name = organizationName;
            kaoData.slug = slug;
        }
        if (email) kaoData.email = email;

        const updatedKao = await prisma.kao.update({ where: { id }, data: kaoData, include: { user: true } });

        await logAudit({
            req,
            action: "KAO_UPDATED",
            entityType: "KAO",
            entityId: updatedKao.id,
            changes: {
                organizationName,
                name,
                email,
            },
            reason: "Super admin updated KAO",
        });

        return res.status(200).json({
            success: true,
            data: {
                id: updatedKao.id,
                name: updatedKao.name,
                email: updatedKao.email,
                slug: updatedKao.slug,
                loginUrl: `/kao/${updatedKao.slug}/login`,
                isActive: updatedKao.user?.isActive ?? true,
                createdAt: updatedKao.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteKao = async (req, res) => {
    try {
        const { id } = req.params;
        const kao = await prisma.kao.findUnique({ where: { id }, include: { clients: true } });

        if (!kao) return res.status(404).json({ success: false, message: "KAO not found" });

        if ((kao.clients || []).length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete KAO with existing clients" });
        }

        await prisma.$transaction([
            prisma.kao.delete({ where: { id } }),
            prisma.user.delete({ where: { id: kao.userId } }),
        ]);

        await logAudit({
            req,
            action: "KAO_DELETED",
            entityType: "KAO",
            entityId: id,
            changes: {
                name: kao.name,
                email: kao.email,
            },
            reason: "Super admin deleted KAO",
        });

        return res.status(200).json({ success: true, message: "KAO deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prisma.client.findUnique({
            where: { id },
            include: { companies: true, kao: true, user: true },
        });

        if (!client) return res.status(404).json({ success: false, message: "Client not found" });

        return res.status(200).json({
            success: true,
            data: {
                id: client.id,
                clientCode: client.clientCode,
                name: client.name,
                email: client.email,
                slug: client.slug,
                serviceModel: client.serviceModel,
                approvalStatus: client.approvalStatus,
                kaoName: client.kao?.name,
                totalCompanies: client.companies.length,
                isActive: client.user?.isActive ?? true,
                loginUrl: `/client/${client.slug}/login`,
                createdAt: client.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const toggleClientStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const client = await prisma.client.findUnique({ where: { id } });

        if (!client) return res.status(404).json({ success: false, message: "Client not found" });

        const user = await prisma.user.update({
            where: { id: client.userId },
            data: { isActive: Boolean(isActive) },
        });

        await logAudit({
            req,
            action: "CLIENT_STATUS_CHANGED",
            entityType: "Client",
            entityId: client.id,
            changes: {
                isActive: user.isActive,
            },
            reason: "Super admin changed client status",
        });

        return res.status(200).json({ success: true, data: { isActive: user.isActive } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const client = await prisma.client.findUnique({ where: { id } });
        if (!client) return res.status(404).json({ success: false, message: "Client not found" });

        const userId = client.userId;

        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ success: false, message: "Email already exists" });
            }
        }

        const userData = {};
        if (name) userData.name = name;
        if (email) userData.email = email;

        if (Object.keys(userData).length > 0) {
            await prisma.user.update({ where: { id: userId }, data: userData });
        }

        const clientData = {};
        if (name) {
            const slug = slugify(name);
            const existing = await prisma.client.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                return res.status(400).json({ success: false, message: "Client slug already exists" });
            }
            clientData.name = name;
            clientData.slug = slug;
        }
        if (email) clientData.email = email;

        const updatedClient = await prisma.client.update({ where: { id }, data: clientData, include: { user: true, kao: true, companies: true } });

        await logAudit({
            req,
            action: "CLIENT_UPDATED",
            entityType: "Client",
            entityId: updatedClient.id,
            changes: {
                name,
                email,
            },
            reason: "Super admin updated client",
        });

        return res.status(200).json({
            success: true,
            data: {
                id: updatedClient.id,
                name: updatedClient.name,
                email: updatedClient.email,
                slug: updatedClient.slug,
                kaoName: updatedClient.kao?.name,
                totalCompanies: updatedClient.companies.length,
                loginUrl: `/client/${updatedClient.slug}/login`,
                isActive: updatedClient.user?.isActive ?? true,
                createdAt: updatedClient.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prisma.client.findUnique({ where: { id }, include: { companies: true } });

        if (!client) return res.status(404).json({ success: false, message: "Client not found" });

        if ((client.companies || []).length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete client with existing companies" });
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
            },
            reason: "Super admin deleted client",
        });

        return res.status(200).json({ success: true, message: "Client deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await prisma.company.findUnique({
            where: { id },
            include: { client: { include: { kao: true } }, uploads: true, user: true },
        });

        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        return res.status(200).json({
            success: true,
            data: {
                id: company.id,
                companyCode: company.companyCode,
                branchCode: company.branchCode,
                name: company.name,
                email: company.email,
                slug: company.slug,
                approvalStatus: company.approvalStatus,
                clientName: company.client?.name,
                kaoName: company.client?.kao?.name,
                totalUploads: company.uploads.length,
                isActive: company.user?.isActive ?? true,
                loginUrl: `/company/${company.slug}/login`,
                createdAt: company.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getApprovalsController = async (req, res) => {
    try {
        const [kaos, clients, companies] = await Promise.all([
            prisma.kao.findMany({ where: { approvalStatus: "PENDING" }, include: { user: true }, orderBy: { createdAt: "desc" } }),
            prisma.client.findMany({ where: { approvalStatus: "PENDING" }, include: { user: true, kao: true }, orderBy: { createdAt: "desc" } }),
            prisma.company.findMany({ where: { approvalStatus: "PENDING" }, include: { user: true, client: { include: { kao: true } } }, orderBy: { createdAt: "desc" } }),
        ]);

        return res.json({
            success: true,
            approvals: [
                ...kaos.map((kao) => ({
                    id: kao.id,
                    entityType: "KAO",
                    code: kao.kaoCode,
                    name: kao.name,
                    email: kao.email,
                    owner: "Super Admin",
                    createdAt: kao.createdAt,
                })),
                ...clients.map((client) => ({
                    id: client.id,
                    entityType: "CLIENT",
                    code: client.clientCode,
                    name: client.name,
                    email: client.email,
                    owner: client.kao?.name,
                    serviceModel: client.serviceModel,
                    createdAt: client.createdAt,
                })),
                ...companies.map((company) => ({
                    id: company.id,
                    entityType: "COMPANY",
                    code: company.companyCode,
                    name: company.name,
                    email: company.email,
                    owner: company.client?.name,
                    kaoName: company.client?.kao?.name,
                    createdAt: company.createdAt,
                })),
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const updateApprovalController = async (req, res) => {
    try {
        const { entityType, id } = req.params;
        const { status } = req.body;
        const normalizedType = entityType.toUpperCase();

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({ success: false, message: "Approval status must be APPROVED or REJECTED" });
        }

        const modelByType = {
            KAO: "kao",
            CLIENT: "client",
            COMPANY: "company",
        };
        const modelName = modelByType[normalizedType];

        if (!modelName) {
            return res.status(400).json({ success: false, message: "Invalid approval entity type" });
        }

        const entity = await prisma[modelName].findUnique({ where: { id } });
        if (!entity) return res.status(404).json({ success: false, message: "Approval entity not found" });

        const updated = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: entity.userId },
                data: { isActive: status === "APPROVED" },
            });

            return tx[modelName].update({
                where: { id },
                data: {
                    approvalStatus: status,
                    approvedAt: status === "APPROVED" ? new Date() : null,
                    approvedBy: status === "APPROVED" ? req.user.id : null,
                },
            });
        });

        await logAudit({
            req,
            action: `${normalizedType}_${status}`,
            entityType: normalizedType,
            entityId: id,
            companyId: normalizedType === "COMPANY" ? id : undefined,
            changes: { approvalStatus: status },
            reason: `Super admin ${status.toLowerCase()} onboarding`,
        });

        return res.json({ success: true, data: updated });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const toggleCompanyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const company = await prisma.company.findUnique({ where: { id } });

        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        const user = await prisma.user.update({
            where: { id: company.userId },
            data: { isActive: Boolean(isActive) },
        });

        await logAudit({
            req,
            action: "COMPANY_STATUS_CHANGED",
            entityType: "Company",
            entityId: company.id,
            companyId: company.id,
            changes: {
                isActive: user.isActive,
            },
            reason: "Super admin changed company status",
        });

        return res.status(200).json({ success: true, data: { isActive: user.isActive } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyName, name, email } = req.body;

        const company = await prisma.company.findUnique({ where: { id } });
        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        const userId = company.userId;

        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ success: false, message: "Email already exists" });
            }
        }

        const userData = {};
        if (name) userData.name = name;
        if (email) userData.email = email;

        if (Object.keys(userData).length > 0) {
            await prisma.user.update({ where: { id: userId }, data: userData });
        }

        const companyData = {};
        if (companyName) {
            const slug = slugify(companyName);
            const existing = await prisma.company.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                return res.status(400).json({ success: false, message: "Company slug already exists" });
            }
            companyData.name = companyName;
            companyData.slug = slug;
        }
        if (email) companyData.email = email;

        const updatedCompany = await prisma.company.update({ where: { id }, data: companyData, include: { user: true, client: { include: { kao: true } }, uploads: true } });

        await logAudit({
            req,
            action: "COMPANY_UPDATED",
            entityType: "Company",
            entityId: updatedCompany.id,
            companyId: updatedCompany.id,
            changes: {
                companyName,
                name,
                email,
            },
            reason: "Super admin updated company",
        });

        return res.status(200).json({
            success: true,
            data: {
                id: updatedCompany.id,
                name: updatedCompany.name,
                email: updatedCompany.email,
                slug: updatedCompany.slug,
                clientName: updatedCompany.client?.name,
                kaoName: updatedCompany.client?.kao?.name,
                totalUploads: updatedCompany.uploads.length,
                loginUrl: `/company/${updatedCompany.slug}/login`,
                isActive: updatedCompany.user?.isActive ?? true,
                createdAt: updatedCompany.createdAt,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await prisma.company.findUnique({ where: { id }, include: { uploads: true } });

        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        if ((company.uploads || []).length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete company with existing uploads" });
        }

        await prisma.$transaction([
            prisma.company.delete({ where: { id } }),
            prisma.user.delete({ where: { id: company.userId } }),
        ]);

        await logAudit({
            req,
            action: "COMPANY_DELETED",
            entityType: "Company",
            entityId: id,
            companyId: id,
            changes: {
                name: company.name,
                email: company.email,
            },
            reason: "Super admin deleted company",
        });

        return res.status(200).json({ success: true, message: "Company deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    createKaoController,
    createClientController,
    createCompanyController,
    getApprovalsController,
    updateApprovalController,
    getAllKaosController,
    getAllClientsController,
    getAllCompaniesController,
    getDashboardData,
    getKaoById,
    updateKao,
    toggleKaoStatus,
    deleteKao,
    getClientById,
    updateClient,
    toggleClientStatus,
    deleteClient,
    getCompanyById,
    updateCompany,
    toggleCompanyStatus,
    deleteCompany,
};
