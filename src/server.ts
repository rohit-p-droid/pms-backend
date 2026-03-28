import "reflect-metadata";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { config } from "./config/index.js";
import { initializeDatabase } from "./config/database.js";
import authRoutes from "./modules/auth/auth.route.js";
import docsRoutes from "./modules/docs/docs.route.js";
import { globalErrorHandler } from "./shared/middlewares/errorHandler.js";

dotenv.config();

// Suppress pg deprecation warning (will be resolved in pg@9.0)
process.noDeprecation = false;
process.removeAllListeners("warning");
process.on("warning", (warning) => {
    if (warning.name === "DeprecationWarning" && warning.message.includes("client.query()")) {
        return; // Suppress this specific warning
    }
    console.warn(warning);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
    res.json({
        statusCode: 200,
        message: "API is running 🚀",
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", docsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        statusCode: 404,
        message: "Route not found",
        error: true,
    });
});

// Global Error Handler Middleware (MUST be last)
app.use(globalErrorHandler);

// Initialize database and start server
const startServer = async (): Promise<void> => {
    try {
        // Initialize database connection
        await initializeDatabase();

        // Start listening
        const PORT = Number(config.PORT);
        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log(`✅ Server running on port ${PORT}`);
        });

        // Graceful shutdown handlers
        process.on("SIGTERM", () => {
            console.log("📍 SIGTERM received, shutting down gracefully...");
            server.close(() => {
                console.log("✅ Server closed");
                process.exit(0);
            });
        });

        process.on("SIGINT", () => {
            console.log("📍 SIGINT received, shutting down gracefully...");
            server.close(() => {
                console.log("✅ Server closed");
                process.exit(0);
            });
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

startServer();
