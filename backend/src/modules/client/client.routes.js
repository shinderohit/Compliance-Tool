const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

const {
    getClientDashboard,
    getClientCompanies,
    getClientEmployees,
} = require("./client.controller");

const router = express.Router();

router.get(
    "/dashboard",
    authMiddleware,
    authorizeRoles("CLIENT"),
    getClientDashboard
);

router.get(
    "/companies",
    authMiddleware,
    authorizeRoles("CLIENT"),
    getClientCompanies
);

router.get(
    "/employees",
    authMiddleware,
    authorizeRoles("CLIENT"),
    getClientEmployees
);

module.exports = router;
