import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";
import type { User } from "../../user/entities/user.entity.js";
import type { PasswordCredential } from "./password-credential.entity.js";

@Entity("password_folders")
export class PasswordFolder {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ name: "user_id" })
    userId!: string;

    @ManyToOne("User", (user: any) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany("PasswordCredential", (credential: any) => credential.folder, {
        cascade: true,
    })
    credentials!: PasswordCredential[];

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
