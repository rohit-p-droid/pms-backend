import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import type { User } from "../../user/entities/user.entity.js";
import type { PasswordFolder } from "./password-folder.entity.js";

@Entity("password_credentials")
export class PasswordCredential {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ name: "encrypted_username", type: "text" })
    encryptedUsername!: string;

    @Column({ name: "encrypted_password", type: "text" })
    encryptedPassword!: string;

    @Column({ name: "folder_id" })
    folderId!: string;

    @ManyToOne("PasswordFolder", (folder: any) => folder.credentials, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "folder_id" })
    folder!: PasswordFolder;

    @Column({ name: "user_id" })
    userId!: string;

    @ManyToOne("User", (user: any) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
