import { jwtService } from "./jwt.service.js";
import { User } from "../../user/entities/user.entity.js";
import { registerSchema, loginSchema, updateSecretKeySchema, changePasswordSchema } from "../schemas/auth.schema.js";
import { userRepository } from "../../user/repositories/user.repository.js";
import type { UserResponse, AuthResponse, } from "../schemas/auth.schema.js";
import { ConflictError, AuthenticationError, ValidationError } from "../../../shared/errors/AppError.js";

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

    async verifyPassword(userId: string, passwordToVerify: string): Promise<boolean> {
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new AuthenticationError("User not found or inactive");
        }
        return await user.comparePassword(passwordToVerify);
    }

    async updateSecretKey(userId: string, payload: unknown): Promise<UserResponse> {
        const validatedData = updateSecretKeySchema.parse(payload);
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new AuthenticationError("User not found or inactive");
        }
        if (user.encryptedSecretKey) {
            throw new ValidationError("Secret key is already initialized. Use changePassword instead to rotate it.");
        }
        
        user.encryptedSecretKey = validatedData.encryptedSecretKey;
        await userRepository.save(user);
        
        return this.mapUserToResponse(user);
    }

    async changePassword(userId: string, payload: unknown): Promise<UserResponse> {
        const validatedData = changePasswordSchema.parse(payload);
        const user = await userRepository.findById(userId);
        if (!user || !user.isActive) {
            throw new AuthenticationError("User not found or inactive");
        }

        const isPasswordValid = await user.comparePassword(validatedData.oldPassword);
        if (!isPasswordValid) {
            throw new AuthenticationError("Incorrect old password");
        }

        user.password = validatedData.newPassword;
        if (validatedData.newEncryptedSecretKey !== undefined) {
             user.encryptedSecretKey = validatedData.newEncryptedSecretKey;
        }
        
        // Use TypeORM lifecycle hooks to automatically hash the new password via @BeforeUpdate or similar
        // Wait, @BeforeInsert hashes password. Does TypeORM @BeforeUpdate hash password?
        // Let's manually hash it or ensure the entity saves correctly. 
        // Our user entity has @BeforeInsert. Let's export bcrypt logic or just call it directly.
        await user.hashPassword(); 
        await userRepository.save(user);

        return this.mapUserToResponse(user);
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
