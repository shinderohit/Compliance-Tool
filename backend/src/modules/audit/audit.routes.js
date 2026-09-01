const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");
const { getAuditLogs } = require("./audit.controller");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN", "KAO", "COMPANY"),
    getAuditLogs,
);

module.exports = router;
