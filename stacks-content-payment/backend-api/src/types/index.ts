// Type definitions for the backend API

export interface ContentMetadata {
    creator: string;
    ipfsHash: string;
    priceStx: number;
    priceToken?: number;
    tokenContract?: string;
    metadataUri: string;
    createdAt: number;
    isActive: boolean;
}

export interface ContentInfo {
    contentId: number;
    metadata: ContentMetadata;
}

export interface PaymentReceipt {
    receiptId: number;
    user: string;
    contentId: number;
    amount: number;
    timestamp: number;
    txSender: string;
}

export interface UserAccess {
    user: string;
    contentId: number;
    paidAmount: number;
    purchasedAt: number;
    expiresAt?: number;
}

export interface RegisterContentRequest {
    creator: string;
    ipfsHash: string;
    priceStx: number;
    metadataUri: string;
}

export interface RegisterContentWithTokenRequest extends RegisterContentRequest {
    priceToken: number;
    tokenContract: string;
}

export interface UpdatePriceRequest {
    creator: string;
    contentId: number;
    newPrice: number;
}

export interface PaymentRequest {
    user: string;
    contentId: number;
    tokenContract?: string;
}

export interface VerifyAccessRequest {
    user: string;
    contentId: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface SubscriptionTier {
    creator: string;
    tier: number;
    name: string;
    price: number;
    durationBlocks: number;
    benefits: string;
}

export interface Subscription {
    user: string;
    creator: string;
    tier: number;
    startedAt: number;
    expiresAt: number;
    autoRenew: boolean;
    pricePerPeriod: number;
}
