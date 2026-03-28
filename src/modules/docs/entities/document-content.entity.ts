import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    Index,
} from "typeorm";
import { Node } from "./node.entity.js";

@Entity("document_contents")
export class DocumentContent {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index({ unique: true })
    @Column({ type: "uuid" })
    nodeId!: string;

    @Column({ type: "jsonb", nullable: true, default: null })
    content!: object | null;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

    @OneToOne(() => Node, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "nodeId" })
    node!: Node;
}
