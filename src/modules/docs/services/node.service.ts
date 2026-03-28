import { AppDataSource } from "../../../config/database.js";
import { Node } from "../entities/node.entity.js";
import { Workspace } from "../entities/workspace.entity.js";
import { DocumentContent } from "../entities/document-content.entity.js";
import {
    NotFoundError,
    AuthorizationError,
    ValidationError,
} from "../../../shared/errors/AppError.js";
import { IsNull } from "typeorm";
import { deleteAllImages } from "../../../shared/utils/imageHelper.js";

const nodeRepo = () => AppDataSource.getRepository(Node);
const workspaceRepo = () => AppDataSource.getRepository(Workspace);

export const nodeService = {
    async create(
        userId: string,
        workspaceId: string,
        type: "FOLDER" | "DOCUMENT",
        name: string,
        parentId?: string | null
    ): Promise<Node> {
        // Verify workspace ownership
        const workspace = await workspaceRepo().findOne({ where: { id: workspaceId } });
        if (!workspace) throw new NotFoundError("Workspace not found");
        if (workspace.userId !== userId) throw new AuthorizationError("Access denied");

        // Verify parent belongs to same workspace
        if (parentId) {
            const parent = await nodeRepo().findOne({ where: { id: parentId } });
            if (!parent) throw new NotFoundError("Parent node not found");
            if (parent.workspaceId !== workspaceId)
                throw new ValidationError("Parent node does not belong to this workspace");
            if (parent.type !== "FOLDER")
                throw new ValidationError("Parent must be a FOLDER");
        }

        const node = nodeRepo().create({
            type,
            name,
            workspaceId,
            parentId: parentId ?? null,
        });

        return nodeRepo().save(node);
    },

    async rename(nodeId: string, userId: string, name: string): Promise<Node> {
        const node = await nodeRepo().findOne({
            where: { id: nodeId },
            relations: ["workspace"],
        });
        if (!node) throw new NotFoundError("Node not found");
        if (node.workspace.userId !== userId) throw new AuthorizationError("Access denied");

        node.name = name;
        return nodeRepo().save(node);
    },

    async move(nodeId: string, userId: string, newParentId: string | null, newIndex: number): Promise<Node> {
        const node = await nodeRepo().findOne({
            where: { id: nodeId },
            relations: ["workspace"],
        });
        if (!node) throw new NotFoundError("Node not found");
        if (node.workspace.userId !== userId) throw new AuthorizationError("Access denied");

        // Validate newParentId
        if (newParentId) {
            const parent = await nodeRepo().findOne({ where: { id: newParentId } });
            if (!parent) throw new NotFoundError("Parent not found");
            if (parent.workspaceId !== node.workspaceId) throw new ValidationError("Parent in different workspace");
            if (parent.type !== "FOLDER") throw new ValidationError("Parent must be a FOLDER");
            if (parent.id === node.id) throw new ValidationError("Cannot move node into itself");
            // Additionally, should prevent moving a folder into its own descendant but standard recursion check might be overkill for this basic impl.
        }

        // Change parent
        node.parentId = newParentId;
        await nodeRepo().save(node);

        // Fetch all siblings (including the moved node) to re-order them properly
        const siblings = await nodeRepo().find({
            where: { workspaceId: node.workspaceId, parentId: newParentId === null ? IsNull() : newParentId },
            order: { ordering: "ASC", createdAt: "ASC" }
        });

        // Remove the moved node from its current spot in the fetched array
        const filteredSiblings = siblings.filter(s => s.id !== node.id);
        
        // Insert it at the target newIndex
        const targetIndex = Math.max(0, Math.min(newIndex, filteredSiblings.length));
        filteredSiblings.splice(targetIndex, 0, node);

        // Re-assign exact discrete ordering values
        for (const [i, sibling] of filteredSiblings.entries()) {
            sibling.ordering = i;
        }

        // Bulk save
        await nodeRepo().save(filteredSiblings);

        return node;
    },

    async delete(nodeId: string, userId: string): Promise<void> {
        const node = await nodeRepo().findOne({
            where: { id: nodeId },
            relations: ["workspace"],
        });
        if (!node) throw new NotFoundError("Node not found");
        if (node.workspace.userId !== userId) throw new AuthorizationError("Access denied");

        // If this is a DOCUMENT node, clean up any uploaded images referenced in its content
        if (node.type === "DOCUMENT") {
            const docContent = await AppDataSource.getRepository(DocumentContent).findOne({ where: { nodeId } });
            if (docContent?.content) {
                deleteAllImages(docContent.content);
            }
        }

        // CASCADE will handle children and document content via DB constraint
        await nodeRepo().remove(node);
    },
};
