const { z } = require("zod");

const optionalText = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().optional(),
);

const createClientSchema = z.object({
    body: z.object({
        companyName: z.string().trim().min(1, "Client organization name is required"),
        companyNameAsPerGstCertificate: z.string().trim().min(1, "Company name as per GST certificate is required"),
        name: z.string().trim().min(1, "Client admin name is required"),
        email: z.string().trim().email("Valid email is required"),
        password: optionalText,
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
    body: z.object({
        clientId: z.string().trim().min(1, "Client is required"),
        companyName: z.string().trim().min(1, "Company name is required"),
        companyNameAsPerGstCertificate: z.string().trim().min(1, "Company name as per GST certificate is required"),
        name: z.string().trim().min(1, "Company admin name is required"),
        email: z.string().trim().email("Valid email is required"),
        password: optionalText,
        seDetails: z.string().trim().min(1, "S&E details are required"),
        natureOfWork: z.string().trim().min(1, "Nature of work is required"),
        industryId: z.string().trim().min(1, "Industry is required"),
        appropriateGovernment: z.enum(["CENTRAL", "STATE"], {
            message: "Appropriate government must be Central or State",
        }),
        branchCode: optionalText,
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

const idParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "ID is required"),
    }),
});

const updateClientSchema = z.object({
    params: idParamSchema.shape.params,
    body: z.object({
        name: z.string().trim().min(1, "Client name is required").optional(),
        email: z.string().trim().email("Valid email is required").optional(),
    }),
});

module.exports = {
    createClientSchema,
    idParamSchema,
    updateClientSchema,
};
