import { AppDataSource } from "../../../config/database.js";
import { Workspace } from "../entities/workspace.entity.js";
import { Node } from "../entities/node.entity.js";
import { NotFoundError, AuthorizationError } from "../../../shared/errors/AppError.js";

const workspaceRepo = () => AppDataSource.getRepository(Workspace);
const nodeRepo = () => AppDataSource.getRepository(Node);

/**
 * Build a nested tree from a flat list of nodes.
 * O(n) — uses a map to avoid recursive DB queries.
 */
function buildTree(nodes: Node[]): any[] {
    const map = new Map<string, any>();

    for (const node of nodes) {
        map.set(node.id, {
            id: node.id,
            type: node.type,
            name: node.name,
            parentId: node.parentId,
            description: node.description,
            workspaceId: node.workspaceId,
            ordering: node.ordering,
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
            children: [],
        });
    }

    const roots: any[] = [];

    for (const node of nodes) {
        const mapped = map.get(node.id)!;
        if (node.parentId && map.has(node.parentId)) {
            map.get(node.parentId)!.children.push(mapped);
        } else {
            roots.push(mapped);
        }
    }

    // Sort roots and children by ordering asc, then by createdAt asc
    const sortNodes = (arr: any[]) => {
        arr.sort((a, b) => a.ordering - b.ordering || a.createdAt.getTime() - b.createdAt.getTime());
        for (const n of arr) sortNodes(n.children);
    };
    sortNodes(roots);

    return roots;
}

export const workspaceService = {
    async listForUser(userId: string): Promise<Workspace[]> {
        return workspaceRepo().find({
            where: { userId },
            order: { createdAt: "ASC" },
        });
    },

    async create(userId: string, name: string, description?: string | null): Promise<Workspace> {
        const ws = workspaceRepo().create({ userId, name, description });
        return workspaceRepo().save(ws);
    },

    async getTree(workspaceId: string, userId: string): Promise<any[]> {
        // Ownership check
        const workspace = await workspaceRepo().findOne({ where: { id: workspaceId } });
        if (!workspace) throw new NotFoundError("Workspace not found");
        if (workspace.userId !== userId) throw new AuthorizationError("Access denied");

        const nodes = await nodeRepo().find({
            where: { workspaceId },
            order: { ordering: "ASC", createdAt: "ASC" },
        });

        return buildTree(nodes);
    },

    async update(workspaceId: string, userId: string, name: string, description?: string | null): Promise<Workspace> {
        const workspace = await workspaceRepo().findOne({ where: { id: workspaceId } });
        if (!workspace) throw new NotFoundError("Workspace not found");
        if (workspace.userId !== userId) throw new AuthorizationError("Access denied");

        workspace.name = name;
        if (description !== undefined) {
            workspace.description = description;
        }
        return workspaceRepo().save(workspace);
    },

    async delete(workspaceId: string, userId: string): Promise<void> {
        const workspace = await workspaceRepo().findOne({ where: { id: workspaceId } });
        if (!workspace) throw new NotFoundError("Workspace not found");
        if (workspace.userId !== userId) throw new AuthorizationError("Access denied");
        await workspaceRepo().remove(workspace);
    },
};
