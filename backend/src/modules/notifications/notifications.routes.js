const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");
const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} = require("./notifications.controller");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    authorizeRoles("COMPANY"),
    getNotifications,
);

router.patch(
    "/read-all",
    authMiddleware,
    authorizeRoles("COMPANY"),
    markAllNotificationsRead,
);

router.patch(
    "/:id/read",
    authMiddleware,
    authorizeRoles("COMPANY"),
    markNotificationRead,
);

module.exports = router;
