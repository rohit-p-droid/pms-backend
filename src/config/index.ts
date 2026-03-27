export const config = {
    PORT: process.env.PORT || 5000,

    POSTGRESQL_DB_URL: process.env.POSTGRESQL_DB_URL,
    
    NODE_ENV: process.env.NODE_ENV || "development",
    
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || "7d",
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "10", 10),
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
};