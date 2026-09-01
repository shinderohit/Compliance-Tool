const { z } = require("zod");

const idParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "ID is required"),
    }),
});

const optionalText = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().optional(),
);

const statusSchema = z.object({
    params: idParamSchema.shape.params,
    body: z.object({
        isActive: z.boolean(),
    }),
});

const createKaoSchema = z.object({
    body: z.object({
        organizationName: z.string().trim().min(1, "Organization name is required"),
        name: z.string().trim().min(1, "Admin name is required"),
        email: z.string().trim().email("Valid email is required"),
        password: optionalText,
        contactNumber: z.string().trim().optional(),
    }),
});

const createClientSchema = z.object({
    body: z.object({
        companyName: z.string().trim().min(1, "Client organization name is required"),
        companyNameAsPerGstCertificate: z.string().trim().min(1, "Company name as per GST certificate is required"),
        name: z.string().trim().min(1, "Client admin name is required"),
        email: z.string().trim().email("Valid email is required"),
        password: optionalText,
        kaoId: z.string().trim().min(1, "KAO is required"),
        seDetails: z.string().trim().min(1, "S&E details are required"),
        natureOfWork: z.string().trim().min(1, "Nature of work is required"),
        industryId: z.string().trim().min(1, "Industry is required"),
        appropriateGovernment: z.enum(["CENTRAL", "STATE"], {
            message: "Appropriate government must be Central or State",
        }),
        serviceModel: z.enum(["SAAS", "PAAS"]).default("SAAS"),
        state: optionalText,
        city: optionalText,
        location: optionalText,
        pincode: optionalText,
        panNumber: optionalText,
        gstNumber: optionalText,
        pfNumber: optionalText,
        esicNumber: optionalText,
        ptNumber: optionalText,
        lwfNumber: optionalText,
    }),
});

const createCompanySchema = z.object({
    body: createClientSchema.shape.body.extend({
        clientId: z.string().trim().min(1, "Client is required"),
        branchCode: optionalText,
    }).omit({
        kaoId: true,
        serviceModel: true,
    }),
});

const updateKaoSchema = z.object({
    params: idParamSchema.shape.params,
    body: z.object({
        organizationName: z.string().trim().min(1).optional(),
        name: z.string().trim().min(1).optional(),
        email: z.string().trim().email("Valid email is required").optional(),
    }),
});

const updateClientSchema = z.object({
    params: idParamSchema.shape.params,
    body: z.object({
        name: z.string().trim().min(1).optional(),
        email: z.string().trim().email("Valid email is required").optional(),
    }),
});

const updateCompanySchema = z.object({
    params: idParamSchema.shape.params,
    body: z.object({
        companyName: z.string().trim().min(1).optional(),
        name: z.string().trim().min(1).optional(),
        email: z.string().trim().email("Valid email is required").optional(),
    }),
});

module.exports = {
    idParamSchema,
    statusSchema,
    createKaoSchema,
    createClientSchema,
    createCompanySchema,
    updateKaoSchema,
    updateClientSchema,
    updateCompanySchema,
};
