/**
 * Custom Application Error class
 * Extends Error to provide structured error handling
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error - 400
 */
export class ValidationError extends AppError {
    constructor(message: string = "Validation failed") {
        super(message, 400);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Authentication Error - 401
 */
export class AuthenticationError extends AppError {
    constructor(message: string = "Authentication failed") {
        super(message, 401);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Authorization Error - 403
 */
export class AuthorizationError extends AppError {
    constructor(message: string = "Access denied") {
        super(message, 403);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Conflict Error - 409
 */
export class ConflictError extends AppError {
    constructor(message: string = "Resource already exists") {
        super(message, 409);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * Internal Server Error - 500
 */
export class InternalServerError extends AppError {
    constructor(message: string = "Internal server error") {
        super(message, 500);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
