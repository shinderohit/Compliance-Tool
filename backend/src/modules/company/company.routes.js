const express = require("express");
const upload = require("../../config/multer");

const router = express.Router();

const authMiddleware =
    require("../../middlewares/authMiddleware");

const authorizeRoles =
    require("../../middlewares/roleMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const {
    idParamSchema,
    branchIdParamSchema,
    createCompanySchema,
    updateCompanySchema,
    companyProfileSchema,
    branchSchema,
    updateBranchSchema,
} = require("./company.validation");

const {
    createCompanyController,
    createCompanyByKaoController,
    getCompanyDashboard,
    getCompanyProfile,
    updateCompanyProfile,
    getDashboardWidgets,
    getBranches,
    getCompanyEmployees,
    createBranch,
    updateBranch,
    deleteBranch,
    getCompanyDetails,
    updateCompany,
    getCompanyDocuments,
    getCompanyAnalytics,
    getDashboardAnalytics,
    addManualCompliance
} = require("./company.controller");

router.post(
    "/create",
    authMiddleware,
    authorizeRoles("CLIENT"),
    upload.fields([
        { name: "panCertificate", maxCount: 1 },
        { name: "gstCertificate", maxCount: 1 },
        { name: "seCertificate", maxCount: 1 },
        { name: "pfCertificate", maxCount: 1 },
        { name: "esicCertificate", maxCount: 1 },
        { name: "ptCertificate", maxCount: 1 },
        { name: "lwfCertificate", maxCount: 1 },
        { name: "bulkUpload", maxCount: 1 },
    ]),
    validateRequest(createCompanySchema),
    createCompanyController
);

router.get(
    "/dashboard",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getCompanyDashboard
);

router.get(
    "/dashboard/analytics",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getDashboardAnalytics
);

router.get(
    "/dashboard/widgets",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getDashboardWidgets
);

router.get(
    "/profile",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getCompanyProfile
);

router.put(
    "/profile",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(companyProfileSchema),
    updateCompanyProfile
);

router.get(
    "/branches",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getBranches
);

router.get(
    "/employees",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getCompanyEmployees
);

router.post(
    "/branches",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(branchSchema),
    createBranch
);

router.put(
    "/branches/:branchId",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(updateBranchSchema),
    updateBranch
);

router.delete(
    "/branches/:branchId",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(branchIdParamSchema),
    deleteBranch
);

router.get(
    "/:id/documents",
    authMiddleware,
    authorizeRoles(
        "SUPER_ADMIN",
        "KAO",
        "CLIENT"
    ),
    validateRequest(idParamSchema),
    getCompanyDocuments
);

router.get(
    "/:id/analytics",
    authMiddleware,
    authorizeRoles(
        "SUPER_ADMIN",
        "KAO",
        "CLIENT"
    ),
    validateRequest(idParamSchema),
    getCompanyAnalytics
);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles(
        "SUPER_ADMIN",
        "KAO",
        "CLIENT"
    ),
    validateRequest(updateCompanySchema),
    updateCompany
);

router.get(
    "/:id",
    authMiddleware,
    authorizeRoles(
        "SUPER_ADMIN",
        "KAO",
        "CLIENT"
    ),
    validateRequest(idParamSchema),
    getCompanyDetails
);

router.post(
    "/manual",
    authMiddleware,
    authorizeRoles("COMPANY"),
    addManualCompliance
);

module.exports = router;
