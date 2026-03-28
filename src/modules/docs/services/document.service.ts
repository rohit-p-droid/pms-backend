import { AppDataSource } from "../../../config/database.js";
import { DocumentContent } from "../entities/document-content.entity.js";
import { Node } from "../entities/node.entity.js";
import {
    NotFoundError,
    AuthorizationError,
    ValidationError,
} from "../../../shared/errors/AppError.js";
import { deleteRemovedImages } from "../../../shared/utils/imageHelper.js";

const docContentRepo = () => AppDataSource.getRepository(DocumentContent);
const nodeRepo = () => AppDataSource.getRepository(Node);

export const documentService = {
    async getContent(nodeId: string, userId: string): Promise<DocumentContent | null> {
        const node = await nodeRepo().findOne({
            where: { id: nodeId },
            relations: ["workspace"],
        });
        if (!node) throw new NotFoundError("Document not found");
        if (node.type !== "DOCUMENT") throw new ValidationError("Node is not a document");
        if (node.workspace.userId !== userId) throw new AuthorizationError("Access denied");

        const content = await docContentRepo().findOne({ where: { nodeId } });
        return content;
    },

    /**
     * Upsert document content — used by autosave.
     * Does an INSERT ... ON CONFLICT UPDATE using TypeORM's save with existing record lookup.
     */
    async upsertContent(
        nodeId: string,
        userId: string,
        content: object
    ): Promise<DocumentContent> {
        const node = await nodeRepo().findOne({
            where: { id: nodeId },
            relations: ["workspace"],
        });
        if (!node) throw new NotFoundError("Document not found");
        if (node.type !== "DOCUMENT") throw new ValidationError("Node is not a document");
        if (node.workspace.userId !== userId) throw new AuthorizationError("Access denied");

        let docContent = await docContentRepo().findOne({ where: { nodeId } });

        if (!docContent) {
            docContent = docContentRepo().create({ nodeId, content });
        } else {
            // Clean up images that were removed from the document
            deleteRemovedImages(docContent.content, content);
            docContent.content = content;
        }

        return docContentRepo().save(docContent);
    },

    async getRecentDocuments(userId: string, limit = 10): Promise<any[]> {
        // Join through workspace ownership to find recently updated docs
        const results = await docContentRepo()
            .createQueryBuilder("dc")
            .innerJoin("dc.node", "n")
            .innerJoin("n.workspace", "w")
            .where("w.userId = :userId", { userId })
            .orderBy("dc.updatedAt", "DESC")
            .limit(limit)
            .select([
                "dc.nodeId",
                "dc.updatedAt",
                "n.id",
                "n.name",
                "n.workspaceId",
                "w.name",
            ])
            .getRawMany();

        return results.map((r) => ({
            nodeId: r.n_id,
            name: r.n_name,
            workspaceId: r.n_workspaceId ?? r.n_workspace_id,
            workspaceName: r.w_name,
            updatedAt: r.dc_updatedAt ?? r.dc_updated_at,
        }));
    },
};
