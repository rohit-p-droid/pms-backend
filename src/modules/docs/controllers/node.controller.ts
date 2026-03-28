import type { Request, Response } from "express";
import { nodeService } from "../services/node.service.js";
import { ResponseFormatter } from "../../../shared/utils/ResponseFormatter.js";
import { z } from "zod";

const createNodeSchema = z.object({
    workspaceId: z.string().uuid("workspaceId must be a valid UUID"),
    type: z.enum(["FOLDER", "DOCUMENT"]),
    name: z.string().min(1, "Name is required").max(255),
    parentId: z.string().uuid().nullable().optional(),
});

const renameNodeSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
});

const moveNodeSchema = z.object({
    parentId: z.string().uuid("parentId must be a valid UUID").nullable(),
    index: z.number().int().min(0, "Index must be 0 or greater"),
});

export const nodeController = {
    async create(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const { workspaceId, type, name, parentId } = createNodeSchema.parse(req.body);
        const node = await nodeService.create(userId, workspaceId, type, name, parentId);
        res.status(201).json(ResponseFormatter.success(node, "Node created", 201));
    },

    async rename(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const { name } = renameNodeSchema.parse(req.body);
        const node = await nodeService.rename(id, userId, name);
        res.json(ResponseFormatter.success(node, "Node renamed"));
    },

    async move(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const { parentId, index } = moveNodeSchema.parse(req.body);
        const node = await nodeService.move(id, userId, parentId, index);
        res.json(ResponseFormatter.success(node, "Node moved"));
    },

    async remove(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        await nodeService.delete(id, userId);
        res.json(ResponseFormatter.success(null, "Node deleted"));
    },
};
