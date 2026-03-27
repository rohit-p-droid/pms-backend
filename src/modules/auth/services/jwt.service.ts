import jwt from "jsonwebtoken";
import { config } from "../../../config/index.js";

export interface JwtPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

/**
 * JwtService handles all JWT operations
 * Follows the Single Responsibility Principle
 * Encapsulates JWT logic from business logic
 */
export class JwtService {
    /**
     * Generate JWT token
     * @param userId - User ID
     * @param email - User email
     * @returns JWT token
     */
    generateToken(userId: string, email: string): string {
        const payload = { userId, email };
        return jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRATION,
        } as any);
    }

    /**
     * Verify JWT token
     * @param token - JWT token to verify
     * @returns Decoded payload
     */
    verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        } catch (error) {
            throw new Error("Invalid or expired token");
        }
    }

    /**
     * Extract token from Authorization header
     * @param authHeader - Authorization header value
     * @returns Token or null
     */
    extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}

export const jwtService = new JwtService();
