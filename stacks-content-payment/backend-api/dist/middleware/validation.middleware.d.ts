import { Request, Response, NextFunction } from 'express';
/**
 * Validation middleware for content registration
 */
export declare const validateContentRegistration: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Validation middleware for payment requests
 */
export declare const validatePaymentRequest: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Validation middleware for token payment requests
 */
export declare const validateTokenPaymentRequest: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Validate IPFS hash format
 */
export declare const validateIpfsHash: (hash: string) => boolean;
/**
 * Sanitize user input
 */
export declare const sanitizeInput: (input: string) => string;
//# sourceMappingURL=validation.middleware.d.ts.map