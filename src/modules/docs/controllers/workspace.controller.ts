import type { Request, Response } from "express";
import { workspaceService } from "../services/workspace.service.js";
import { ResponseFormatter } from "../../../shared/utils/ResponseFormatter.js";
import { z } from "zod";

const createWorkspaceSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().nullable().optional(),
});

export const workspaceController = {
    async list(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const workspaces = await workspaceService.listForUser(userId);
        res.json(ResponseFormatter.success(workspaces, "Workspaces retrieved"));
    },

    async create(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const { name, description } = createWorkspaceSchema.parse(req.body);
        const workspace = await workspaceService.create(userId, name, description);
        res.status(201).json(ResponseFormatter.success(workspace, "Workspace created", 201));
    },

    async getTree(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const tree = await workspaceService.getTree(id, userId);
        res.json(ResponseFormatter.success(tree, "Tree retrieved"));
    },

    async update(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const { name, description } = createWorkspaceSchema.parse(req.body);
        const workspace = await workspaceService.update(id, userId, name, description);
        res.json(ResponseFormatter.success(workspace, "Workspace updated"));
    },

    async remove(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        await workspaceService.delete(id, userId);
        res.json(ResponseFormatter.success(null, "Workspace deleted"));
    },
};
