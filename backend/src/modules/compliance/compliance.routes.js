const express = require("express");

const router = express.Router();

const upload = require("../../config/multer");

const authMiddleware = require("../../middlewares/authMiddleware");

const authorizeRoles = require("../../middlewares/roleMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const {
    createComplianceMasterSchema,
    bulkComplianceSchema,
} = require("./compliance.validation");

const {
    uploadComplianceController,
    analyzeComplianceDocumentController,
    getUploadsController,
    getAnalyticsController,
    getAllCompliances,
    createCompliance,
    getComplianceMaster,
    getComplianceKPIs,
    createComplianceMaster,
    createBulkComplianceMaster,
    deleteUploadController
} = require("./compliance.controller");

/*
|--------------------------------------------------------------------------
| Upload Compliance Excel/CSV
|--------------------------------------------------------------------------
*/
router.post(
    "/upload",
    authMiddleware,
    authorizeRoles("COMPANY"),
    upload.single("file"),
    uploadComplianceController
);

router.post(
    "/analyze",
    authMiddleware,
    authorizeRoles("COMPANY"),
    upload.single("file"),
    analyzeComplianceDocumentController
);

/*
|--------------------------------------------------------------------------
| Get Uploaded Compliance Files
|--------------------------------------------------------------------------
*/
router.get(
    "/uploads",
    authMiddleware,
    authorizeRoles("COMPANY", "SUPER_ADMIN"),
    getUploadsController
);

/*
|--------------------------------------------------------------------------
| Delete an Uploaded Compliance File
|--------------------------------------------------------------------------
*/
router.delete(
    "/uploads/:id",
    authMiddleware,
    authorizeRoles("COMPANY"),
    deleteUploadController
);

/*
|--------------------------------------------------------------------------
| Compliance Analytics
|--------------------------------------------------------------------------
*/
router.get(
    "/analytics",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN", "KAO", "CLIENT", "COMPANY"),
    getAnalyticsController
);

/*
|--------------------------------------------------------------------------
| Compliance Master Table
|--------------------------------------------------------------------------
*/
router.get(
    "/all",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getAllCompliances
);

router.post(
    "/master",
    authMiddleware,
    authorizeRoles("COMPANY"),
    upload.any(),
    validateRequest(createComplianceMasterSchema),
    createCompliance
);

router.get(
    "/master",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN", "COMPANY"),
    getComplianceMaster
);

router.get(
    "/master/kpis",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getComplianceKPIs
);

router.post(
    "/master/bulk",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(bulkComplianceSchema),
    createBulkComplianceMaster
);

router.post(
    "/manual",
    authMiddleware,
    authorizeRoles("COMPANY"),
    upload.any(),
    validateRequest(createComplianceMasterSchema),
    createComplianceMaster
);

module.exports = router;
