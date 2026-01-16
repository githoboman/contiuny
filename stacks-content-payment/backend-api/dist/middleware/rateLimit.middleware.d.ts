/**
 * General API rate limiter
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for payment endpoints
 */
export declare const paymentLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for content registration
 */
export declare const registrationLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map