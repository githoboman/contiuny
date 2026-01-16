import { Request, Response, NextFunction } from 'express';
/**
 * Global error handling middleware
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found handler
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Async error wrapper
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map