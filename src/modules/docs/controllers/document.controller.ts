import type { Request, Response } from "express";
import { documentService } from "../services/document.service.js";
import { ResponseFormatter } from "../../../shared/utils/ResponseFormatter.js";
import { z } from "zod";

const upsertContentSchema = z.object({
    content: z.record(z.string(), z.unknown()),
});

export const documentController = {
    async getContent(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const content = await documentService.getContent(id, userId);
        res.json(ResponseFormatter.success(content, "Document content retrieved"));
    },

    async upsertContent(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const { content } = upsertContentSchema.parse(req.body);
        const doc = await documentService.upsertContent(id, userId, content as object);
        res.json(ResponseFormatter.success(doc, "Content saved"));
    },

    async getRecentDocuments(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;
        const docs = await documentService.getRecentDocuments(userId);
        res.json(ResponseFormatter.success(docs, "Recent documents retrieved"));
    },
};
