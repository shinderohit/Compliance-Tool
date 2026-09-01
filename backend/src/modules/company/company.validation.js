const { z } = require("zod");

const optionalText = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().optional(),
);

const idParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "ID is required"),
    }),
});

const branchIdParamSchema = z.object({
    params: z.object({
        branchId: z.string().min(1, "Branch ID is required"),
    }),
});

const createCompanySchema = z.object({
    body: z.object({
        companyName: z.string().trim().min(1, "Company name is required"),
        companyNameAsPerGstCertificate: z.string().trim().min(1, "Company name as per GST certificate is required"),
        name: z.string().trim().min(1, "Company admin name is required"),
        email: z.string().trim().email("Valid email is required"),
        password: optionalText,
        seDetails: z.string().trim().min(1, "S&E details are required"),
        natureOfWork: z.string().trim().min(1, "Nature of work is required"),
        industryId: z.string().trim().min(1, "Industry is required"),
        appropriateGovernment: z.string().trim().min(1, "Appropriate government is required"),
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

const updateCompanySchema = z.object({
    params: idParamSchema.shape.params,
    body: z.object({
        name: optionalText,
        email: z.string().trim().email("Valid email is required").optional(),
    }),
});

const companyProfileSchema = z.object({
    body: z.record(z.string(), z.any()),
});

const branchSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Branch name is required"),
        code: optionalText,
        address: optionalText,
        city: optionalText,
        state: optionalText,
        pincode: optionalText,
        phone: optionalText,
        email: z.string().trim().email("Valid email is required").optional(),
    }),
});

const updateBranchSchema = z.object({
    params: branchIdParamSchema.shape.params,
    body: branchSchema.shape.body.partial(),
});

module.exports = {
    idParamSchema,
    branchIdParamSchema,
    createCompanySchema,
    updateCompanySchema,
    companyProfileSchema,
    branchSchema,
    updateBranchSchema,
};
