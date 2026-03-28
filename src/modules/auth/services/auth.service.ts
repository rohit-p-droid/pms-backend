import { jwtService } from "./jwt.service.js";
import { User } from "../../user/entities/user.entity.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { userRepository } from "../../user/repositories/user.repository.js";
import type { UserResponse, AuthResponse, } from "../schemas/auth.schema.js";
import { ConflictError, AuthenticationError } from "../../../shared/errors/AppError.js";

export class AuthService {
    async register(payload: unknown): Promise<AuthResponse> {
        const validatedData = registerSchema.parse(payload);

        const existingUser = await userRepository.findByEmail(validatedData.email);
        if (existingUser) {
            throw new ConflictError("User with this email already exists");
        }

        const user = await userRepository.create({
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            password: validatedData.password,
        });

        const token = jwtService.generateToken(user.id, user.email);

        return {
            access_token: token,
            user: this.mapUserToResponse(user),
        };
    }

    async login(payload: unknown): Promise<AuthResponse> {
        const validatedData = loginSchema.parse(payload);

        const user = await userRepository.findByEmail(validatedData.email);
        if (!user) {
            throw new AuthenticationError("Invalid email or password");
        }

        if (!user.isActive) {
            throw new AuthenticationError("User account is inactive");
        }

        const isPasswordValid = await user.comparePassword(validatedData.password);
        if (!isPasswordValid) {
            throw new AuthenticationError("Invalid email or password");
        }

        const token = jwtService.generateToken(user.id, user.email);
        return {
            access_token: token,
            user: this.mapUserToResponse(user),
        };
    }

    async validateUserByToken(token: string): Promise<User> {
        const payload = jwtService.verifyToken(token);
        const user = await userRepository.findById(payload.userId);
        if (!user || !user.isActive) {
            throw new AuthenticationError("User not found or inactive");
        }
        return user;
    }

    private mapUserToResponse(user: User): UserResponse {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}

export const authService = new AuthService();
