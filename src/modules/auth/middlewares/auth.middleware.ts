import { jwtService } from "../services/jwt.service.js";
import { authService } from "../services/auth.service.js";
import type { Request, Response, NextFunction } from "express";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Follows the Middleware Pattern
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = jwtService.extractTokenFromHeader(
            req.headers.authorization
        );

        if (!token) {
            res.status(401).json({
                statusCode: 401,
                message: "Unauthorized",
                error: true,
            });
            return;
        }

        const user = await authService.validateUserByToken(token);

        (req as any).user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        next();
    } catch (error: any) {
        res.status(401).json({
            statusCode: 401,
            message: error.message || "Invalid or expired token",
            error: true,
        });
    }
};
