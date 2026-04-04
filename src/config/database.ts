import { config } from "./index.js";
import { DataSource } from "typeorm";
import { User } from "../modules/user/entities/user.entity.js";
import { Workspace } from "../modules/docs/entities/workspace.entity.js";
import { Node } from "../modules/docs/entities/node.entity.js";
import { DocumentContent } from "../modules/docs/entities/document-content.entity.js";
import { PasswordFolder } from "../modules/password/entities/password-folder.entity.js";
import { PasswordCredential } from "../modules/password/entities/password-credential.entity.js";

const getDatabaseURL = (): string => {
    const dbUrl = config.POSTGRESQL_DB_URL;
    if (!dbUrl) {
        throw new Error("POSTGRESQL_DB_URL environment variable is not defined");
    }
    return dbUrl;
};

export const AppDataSource = new DataSource({
    type: "postgres",
    url: getDatabaseURL(),
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV === "development",
    entities: [User, Workspace, Node, DocumentContent, PasswordFolder, PasswordCredential],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
    poolSize: 10,
    maxQueryExecutionTime: 1000,
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("[+] Database connection initialized successfully");
        }
    } catch (error) {
        console.error("[-] Failed to initialize database connection:", error);
        throw error;
    }
};
