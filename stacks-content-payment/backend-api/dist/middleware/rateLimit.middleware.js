"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationLimiter = exports.paymentLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * General API rate limiter
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
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
exports.paymentLimiter = (0, express_rate_limit_1.default)({
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
exports.registrationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60000, // 1 minute
    max: 5, // 5 registrations per minute
    message: {
        success: false,
        error: 'Too many registration requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.middleware.js.map