import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { AuthenticationError } from "../../../shared/errors/AppError.js";
import { ResponseFormatter } from "../../../shared/utils/ResponseFormatter.js";

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        const result = await authService.register(req.body);
        res.status(201).json(ResponseFormatter.success(result, "User registered successfully", 201));
    }

    async login(req: Request, res: Response): Promise<void> {
        const result = await authService.login(req.body);
        res.status(200).json(ResponseFormatter.success(result, "Login successful", 200));
    }

    async getMe(req: Request, res: Response): Promise<void> {
        const user = (req as any).user;
        if (!user) {
            throw new AuthenticationError("Unauthorized");
        }

        res.status(200).json(ResponseFormatter.success(user, "User retrieved successfully", 200));
    }

    async verifyPassword(req: Request, res: Response): Promise<void> {
        const user = (req as any).user;
        if (!user) {
            throw new AuthenticationError("Unauthorized");
        }

        const { password } = req.body;
        if (!password) {
             res.status(400).json({ error: "Password is required" });
             return;
        }

        const isMatch = await authService.verifyPassword(user.id, password);
        if (!isMatch) {
            throw new AuthenticationError("Incorrect password");
        }

        res.status(200).json(ResponseFormatter.success({ verified: true }, "Password verified", 200));
    }

    async updateSecretKey(req: Request, res: Response): Promise<void> {
        const user = (req as any).user;
        if (!user) throw new AuthenticationError("Unauthorized");

        const result = await authService.updateSecretKey(user.id, req.body);
        res.status(200).json(ResponseFormatter.success(result, "Secret key updated successfully", 200));
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        const user = (req as any).user;
        if (!user) throw new AuthenticationError("Unauthorized");

        const result = await authService.changePassword(user.id, req.body);
        res.status(200).json(ResponseFormatter.success(result, "Password changed successfully", 200));
    }
}

export const authController = new AuthController();
