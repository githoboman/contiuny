import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for payment endpoints
 */
export const paymentLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        success: false,
        error: 'Too many payment requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for content registration
 */
export const registrationLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 5, // 5 registrations per minute
    message: {
        success: false,
        error: 'Too many registration requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
