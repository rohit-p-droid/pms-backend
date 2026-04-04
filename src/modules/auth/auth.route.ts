import { Router } from "express";
import { authController } from "./controllers/auth.controller.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { asyncHandler } from "../../shared/middlewares/errorHandler.js";

const router = Router();

// Public routes
router.post("/register", asyncHandler((req, res) => authController.register(req, res)));
router.post("/login", asyncHandler((req, res) => authController.login(req, res)));

// Protected routes
router.get("/me", authMiddleware, asyncHandler((req, res) => authController.getMe(req, res)));
router.post("/verify-password", authMiddleware, asyncHandler((req, res) => authController.verifyPassword(req, res)));
router.patch("/secret-key", authMiddleware, asyncHandler((req, res) => authController.updateSecretKey(req, res)));
router.patch("/change-password", authMiddleware, asyncHandler((req, res) => authController.changePassword(req, res)));

export default router;
