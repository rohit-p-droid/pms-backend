import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from "typeorm";
import { Workspace } from "./workspace.entity.js";

export type NodeType = "FOLDER" | "DOCUMENT";

@Entity("nodes")
@Index(["workspaceId"])
@Index(["parentId"])
export class Node {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 50 })
    type!: NodeType;

    @Column({ type: "varchar", length: 255 })
    name!: string;


    @Column({ type: "uuid", nullable: true })
    parentId!: string | null;

    @Column({ type: "uuid" })
    workspaceId!: string;

    @Column({ type: "int", default: 0 })
    ordering!: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

    // Self-referencing relation for nested hierarchy
    @ManyToOne(() => Node, (node) => node.children, {
        nullable: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "parentId" })
    parent!: Node | null;

    @OneToMany(() => Node, (node) => node.parent, { cascade: true })
    children!: Node[];

    @ManyToOne(() => Workspace, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "workspaceId" })
    workspace!: Workspace;
}

