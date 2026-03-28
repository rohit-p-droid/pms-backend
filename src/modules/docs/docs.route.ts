import { Router } from "express";
import { authMiddleware } from "../auth/middlewares/auth.middleware.js";
import { asyncHandler } from "../../shared/middlewares/errorHandler.js";
import { workspaceController } from "./controllers/workspace.controller.js";
import { nodeController } from "./controllers/node.controller.js";
import { documentController } from "./controllers/document.controller.js";

const router = Router();

// All docs routes require auth
router.use(authMiddleware);

// ── Workspaces ────────────────────────────────────────────────────────────────
router.get("/workspaces", asyncHandler((req, res) => workspaceController.list(req, res)));
router.post("/workspaces", asyncHandler((req, res) => workspaceController.create(req, res)));
router.patch("/workspaces/:id", asyncHandler((req, res) => workspaceController.update(req, res)));
router.get("/workspaces/:id/tree", asyncHandler((req, res) => workspaceController.getTree(req, res)));
router.delete("/workspaces/:id", asyncHandler((req, res) => workspaceController.remove(req, res)));

// ── Nodes ─────────────────────────────────────────────────────────────────────
router.post("/nodes", asyncHandler((req, res) => nodeController.create(req, res)));
router.patch("/nodes/:id", asyncHandler((req, res) => nodeController.rename(req, res)));
router.put("/nodes/:id/move", asyncHandler((req, res) => nodeController.move(req, res)));
router.delete("/nodes/:id", asyncHandler((req, res) => nodeController.remove(req, res)));

// ── Documents ─────────────────────────────────────────────────────────────────
router.get("/documents/recent", asyncHandler((req, res) => documentController.getRecentDocuments(req, res)));
router.get("/documents/:id", asyncHandler((req, res) => documentController.getContent(req, res)));
router.put("/documents/:id/content", asyncHandler((req, res) => documentController.upsertContent(req, res)));

export default router;
