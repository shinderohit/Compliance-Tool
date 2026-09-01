const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
    "/super-admin",
    authMiddleware,
    authorizeRoles("SUPER_ADMIN"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Super Admin",
        });
    }
);

module.exports = router;