import { Router } from "express";
import { passwordController } from "./password.controller.js";
import { authMiddleware } from "../auth/middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Folders
router.get("/folders", passwordController.getFolders);
router.post("/folders", passwordController.createFolder);
router.put("/folders/:id", passwordController.updateFolder);
router.delete("/folders/:id", passwordController.deleteFolder);

// Credentials
router.post("/credentials", passwordController.createCredential);
router.put("/credentials/:id", passwordController.updateCredential);
router.delete("/credentials/:id", passwordController.deleteCredential);

export default router;
