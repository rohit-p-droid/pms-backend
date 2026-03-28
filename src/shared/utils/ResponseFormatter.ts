/**
 * Standardized API Response Type
 */
export interface ApiResponse<T = any> {
    statusCode: number;
    message: string;
    data?: T;
    error?: boolean;
    timestamp?: string;
}

/**
 * Response Formatter Utility
 * Ensures consistent response formatting across the application
 */
export class ResponseFormatter {
    /**
     * Format a success response
     * @param data - Response data
     * @param message - Success message
     * @param statusCode - HTTP status code (default: 200)
     * @returns Formatted response object
     */
    static success<T = any>(
        data: T,
        message: string = "Success",
        statusCode: number = 200
    ): ApiResponse<T> {
        return {
            statusCode,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Format an error response
     * @param message - Error message
     * @param statusCode - HTTP status code (default: 500)
     * @returns Formatted error response object
     */
    static error(
        message: string = "Internal server error",
        statusCode: number = 500
    ): ApiResponse {
        return {
            statusCode,
            message,
            error: true,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Format a paginated response
     * @param data - Array of data
     * @param total - Total count
     * @param page - Current page
     * @param limit - Items per page
     * @param message - Success message
     * @returns Formatted paginated response
     */
    static paginated<T = any>(
        data: T[],
        total: number,
        page: number,
        limit: number,
        message: string = "Success"
    ): ApiResponse<{ data: T[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
        return {
            statusCode: 200,
            message,
            data: {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            },
            timestamp: new Date().toISOString(),
        };
    }
}
