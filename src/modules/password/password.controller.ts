import type { Request, Response } from "express";
import { AppDataSource } from "../../config/database.js";
import { PasswordFolder } from "./entities/password-folder.entity.js";
import { PasswordCredential } from "./entities/password-credential.entity.js";

// Repositories
const folderRepo = AppDataSource.getRepository(PasswordFolder);
const credentialRepo = AppDataSource.getRepository(PasswordCredential);

export const passwordController = {
    // --- FOLDERS ---

    async getFolders(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id as string;
            const folders = await folderRepo.find({
                where: { userId },
                relations: ["credentials"],
                order: { createdAt: "ASC" },
            });

            res.status(200).json({
                message: "Folders retrieved successfully",
                data: folders,
            });
        } catch (error) {
            console.error("Error getting password folders:", error);
            res.status(500).json({ error: "Failed to retrieve folders" });
        }
    },

    async createFolder(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id as string;
            const { name } = req.body;

            if (!name) {
                res.status(400).json({ error: "Folder name is required" });
                return;
            }

            const folder = folderRepo.create({
                name,
                userId,
            });

            await folderRepo.save(folder);

            res.status(201).json({
                message: "Folder created successfully",
                data: folder,
            });
        } catch (error) {
            console.error("Error creating folder:", error);
            res.status(500).json({ error: "Failed to create folder" });
        }
    },

    async updateFolder(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id as string;
            const folderId = req.params.id as string;
            const { name } = req.body;

            const folder = await folderRepo.findOne({ where: { id: folderId, userId } });
            if (!folder) {
                res.status(404).json({ error: "Folder not found" });
                return;
            }

            folder.name = name || folder.name;
            await folderRepo.save(folder);

            res.status(200).json({
                message: "Folder updated successfully",
                data: folder,
            });
        } catch (error) {
            console.error("Error updating folder:", error);
            res.status(500).json({ error: "Failed to update folder" });
        }
    },

    async deleteFolder(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id as string;
            const folderId = req.params.id as string;

            const folder = await folderRepo.findOne({ where: { id: folderId, userId } });
            if (!folder) {
                res.status(404).json({ error: "Folder not found" });
                return;
            }

            await folderRepo.remove(folder);

            res.status(200).json({
                message: "Folder deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting folder:", error);
            res.status(500).json({ error: "Failed to delete folder" });
        }
    },

    // --- CREDENTIALS ---

    async createCredential(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id as string;
            const { name, encryptedUsername, encryptedPassword, folderId } = req.body;

            if (!name || !encryptedUsername || !encryptedPassword || !folderId) {
                res.status(400).json({ error: "All fields are required" });
                return;
            }

            const folder = await folderRepo.findOne({ where: { id: folderId as string, userId } });
            if (!folder) {
                res.status(404).json({ error: "Folder not found" });
                return;
            }

            const credential = credentialRepo.create({
                name,
                encryptedUsername,
                encryptedPassword,
                folderId,
                userId,
            });

            await credentialRepo.save(credential);

            res.status(201).json({
                message: "Credential created successfully",
                data: credential,
            });
        } catch (error) {
            console.error("Error creating credential:", error);
            res.status(500).json({ error: "Failed to create credential" });
        }
    },

    async updateCredential(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id as string;
            const credentialId = req.params.id as string;
            const { name, encryptedUsername, encryptedPassword, folderId } = req.body;

            const credential = await credentialRepo.findOne({ where: { id: credentialId, userId } });
            if (!credential) {
                res.status(404).json({ error: "Credential not found" });
                return;
            }

            if (folderId && folderId !== credential.folderId) {
                const folder = await folderRepo.findOne({ where: { id: folderId as string, userId } });
                if (!folder) {
                    res.status(404).json({ error: "Folder not found" });
                    return;
                }
                credential.folderId = folderId;
            }

            if (name) credential.name = name;
            if (encryptedUsername) credential.encryptedUsername = encryptedUsername;
            if (encryptedPassword) credential.encryptedPassword = encryptedPassword;

            await credentialRepo.save(credential);

            res.status(200).json({
                message: "Credential updated successfully",
                data: credential,
            });
        } catch (error) {
            console.error("Error updating credential:", error);
            res.status(500).json({ error: "Failed to update credential" });
        }
    },

    async deleteCredential(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id as string;
            const credentialId = req.params.id as string;

            const credential = await credentialRepo.findOne({ where: { id: credentialId, userId } });
            if (!credential) {
                res.status(404).json({ error: "Credential not found" });
                return;
            }

            await credentialRepo.remove(credential);

            res.status(200).json({
                message: "Credential deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting credential:", error);
            res.status(500).json({ error: "Failed to delete credential" });
        }
    },
};
