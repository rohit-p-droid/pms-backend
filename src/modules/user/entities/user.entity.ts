import bcrypt from "bcrypt";
import { config } from "../../../config/index.js";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert, } from "typeorm";

@Entity("users")
@Index(["email"], { unique: true })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    firstName!: string;

    @Column({ type: "varchar", length: 255 })
    lastName!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    password!: string;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "text", nullable: true })
    encryptedSecretKey!: string | null;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

    /**
     * Hash password before saving to database
     * Following the Dependency Inversion Principle
     */
    @BeforeInsert()
    async hashPassword(): Promise<void> {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, config.BCRYPT_ROUNDS);
        }
    }

    /**
     * Compare provided password with hashed password
     * @param plainPassword - The plain text password to compare
     * @returns Promise<boolean> - True if passwords match, false otherwise
     */
    async comparePassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.password);
    }
}
