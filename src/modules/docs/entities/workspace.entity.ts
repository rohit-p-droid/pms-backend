import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from "typeorm";

@Entity("workspaces")
@Index(["userId"])
export class Workspace {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "uuid" })
    userId!: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
}

