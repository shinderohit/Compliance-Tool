const express = require("express");

const {
    register,
    loginController,
    forgotPassword,
    changePassword,
    getProfile,
    updateProfile,
    createLogin,
} = require("./auth.controller");

const authMiddleware = require("../../middlewares/authMiddleware");
const validateRequest = require("../../middlewares/validateRequest");
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    changePasswordSchema,
    updateProfileSchema,
    createLoginSchema,
} = require("./auth.validation");

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);

router.post("/login", validateRequest(loginSchema), loginController);

router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);

router.post(
    "/change-password",
    authMiddleware,
    validateRequest(changePasswordSchema),
    changePassword,
);

router.get("/profile", authMiddleware, getProfile);

router.patch(
    "/profile",
    authMiddleware,
    validateRequest(updateProfileSchema),
    updateProfile,
);

router.post(
    "/create-login",
    authMiddleware,
    validateRequest(createLoginSchema),
    createLogin,
);

module.exports = router;
