import { User } from "../entities/user.entity.js";
import { AppDataSource } from "../../../config/database.js";

/**
 * UserRepository follows the Repository Pattern
 * Encapsulates data access logic
 * Adheres to Single Responsibility Principle
 */
export class UserRepository {
    private repository = AppDataSource.getRepository(User);

    /**
     * Find user by email
     * @param email - User email
     * @returns User or null
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({
            where: { email },
        });
    }

    /**
     * Find user by ID
     * @param id - User ID
     * @returns User or null
     */
    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
        });
    }

    /**
     * Create and save a new user
     * @param userData - User data to create
     * @returns Created user
     */
    async create(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    /**
     * Save an existing user entity instance
     */
    async save(user: User): Promise<User> {
        return this.repository.save(user);
    }

    /**
     * Update user
     * @param id - User ID
     * @param userData - Data to update
     * @returns Updated user
     */
    async update(id: string, userData: Partial<User>): Promise<User | null> {
        await this.repository.update(id, userData);
        return this.findById(id);
    }

    /**
     * Delete user
     * @param id - User ID
     * @returns Deletion result
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected! > 0;
    }

    /**
     * Find all active users (with pagination support)
     * @param page - Page number
     * @param limit - Items per page
     * @returns Users and total count
     */
    async findAll(page: number = 1, limit: number = 10): Promise<[User[], number]> {
        return this.repository.findAndCount({
            where: { isActive: true },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" },
        });
    }
}

export const userRepository = new UserRepository();
