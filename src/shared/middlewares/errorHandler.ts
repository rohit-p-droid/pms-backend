import { AppError } from "../errors/AppError.js";
import type { Request, Response, NextFunction } from "express";
import { ResponseFormatter } from "../utils/ResponseFormatter.js";
import { ZodError } from "zod";

export const globalErrorHandler = (
    error: Error | AppError | ZodError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let message = "Internal server error";

    // Handle Zod Validation Errors
    if (error instanceof ZodError) {
        statusCode = 400;
        const errors = error.issues.map((issue: any) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
        message = "Validation failed";
        
        res.status(statusCode).json({
            statusCode,
            message,
            error: true,
            details: errors,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    // Handle Custom AppError instances
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    // Handle generic errors
    else {
        message = error.message || "An unexpected error occurred";
        console.error("Unhandled Error:", error);
    }

    res.status(statusCode).json(ResponseFormatter.error(message, statusCode));
};


export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
