const express = require("express");

const authMiddleware = require("../../middlewares/authMiddleware");

const authorizeRoles = require("../../middlewares/roleMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const upload = require("../../config/multer");
const {
    createClientSchema,
    createCompanySchema,
    idParamSchema,
    updateClientSchema,
} = require("./kao.validation");

const {
    createClientController,
    createCompanyController,
    getAllClientsController,
    getKaoDashboardController,
    getKaoCompanies,
    updateKaoClient,
    deleteKaoClient,
} = require("./kao.controller");

const router = express.Router();

router.post(
    "/create-client",
    authMiddleware,
    authorizeRoles("KAO"),
    upload.fields([
        { name: "companyLogo", maxCount: 1 },
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
    authorizeRoles("KAO"),
    upload.fields([
        { name: "companyLogo", maxCount: 1 },
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
    authorizeRoles("KAO"),
    getKaoDashboardController
);

router.get(
    "/companies",
    authMiddleware,
    authorizeRoles("KAO"),
    getKaoCompanies
);

router.get(
    "/clients",
    authMiddleware,
    authorizeRoles("KAO"),
    getAllClientsController
);

router.patch(
    "/clients/:id",
    authMiddleware,
    authorizeRoles("KAO"),
    validateRequest(updateClientSchema),
    updateKaoClient
);

router.delete(
    "/clients/:id",
    authMiddleware,
    authorizeRoles("KAO"),
    validateRequest(idParamSchema),
    deleteKaoClient
);

module.exports = router;
