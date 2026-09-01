const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");

const authorizeRoles = require("../../middlewares/roleMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const upload = require("../../config/multer");
const {
    idParamSchema,
    statusSchema,
    createKaoSchema,
    createClientSchema,
    createCompanySchema,
    updateKaoSchema,
    updateClientSchema,
    updateCompanySchema,
} = require("./superAdmin.validation");

const {
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
} = require("./superAdmin.controller");

/* =========================
   CREATE KAO
========================= */

router.post(
    "/create-kao",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(createKaoSchema),
    createKaoController
);

router.post(
    "/create-client",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
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
    validateRequest(createClientSchema),
    createClientController
);

router.post(
    "/create-company",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
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
    "/approvals",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    getApprovalsController
);

router.patch(
    "/approvals/:entityType/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    updateApprovalController
);

/* =========================
   GET ALL KAOS
========================= */

router.get(
    "/kaos",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    getAllKaosController
);

router.get(
    "/kaos/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(idParamSchema),
    getKaoById
);

router.patch(
    "/kaos/:id/status",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(statusSchema),
    toggleKaoStatus
);

router.delete(
    "/kaos/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(idParamSchema),
    deleteKao
);

router.get(
    "/clients",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    getAllClientsController
);

router.get(
    "/clients/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(idParamSchema),
    getClientById
);

router.patch(
    "/clients/:id/status",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(statusSchema),
    toggleClientStatus
);

router.delete(
    "/clients/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(idParamSchema),
    deleteClient
);

router.get(
    "/companies",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    getAllCompaniesController
);

router.get(
    "/companies/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(idParamSchema),
    getCompanyById
);

router.patch(
    "/companies/:id/status",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(statusSchema),
    toggleCompanyStatus
);

router.delete(
    "/companies/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(idParamSchema),
    deleteCompany
);

/* =========================
   DASHBOARD DATA
========================= */

router.get(
    "/dashboard",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    getDashboardData
);

router.patch(
    "/kaos/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(updateKaoSchema),
    updateKao
);

router.patch(
    "/clients/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(updateClientSchema),
    updateClient
);

router.patch(
    "/companies/:id",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    validateRequest(updateCompanySchema),
    updateCompany
);

module.exports = router;
