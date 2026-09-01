const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const {
    idParamSchema,
    rejectApprovalSchema,
} = require("./approval.validation");
const {
    getApprovalQueue,
    submitComplianceForApproval,
    approveCompliance,
    rejectCompliance,
} = require("./approval.controller");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getApprovalQueue,
);

router.post(
    "/:id/submit",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(idParamSchema),
    submitComplianceForApproval,
);

router.post(
    "/:id/approve",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(idParamSchema),
    approveCompliance,
);

router.post(
    "/:id/reject",
    authMiddleware,
    authorizeRoles("COMPANY"),
    validateRequest(rejectApprovalSchema),
    rejectCompliance,
);

module.exports = router;
