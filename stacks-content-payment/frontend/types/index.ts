// TypeScript types for the frontend

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

export interface Content {
    contentId: number;
    metadata: ContentMetadata;
}

export interface UserAccess {
    user: string;
    contentId: number;
    paidAmount: number;
    purchasedAt: number;
    expiresAt?: number;
}

export interface PaymentReceipt {
    receiptId: number;
    user: string;
    contentId: number;
    amount: number;
    timestamp: number;
    txSender: string;
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

export type PaymentType = 'stx' | 'token';

export interface WalletState {
    address: string | null;
    isConnected: boolean;
    balance: number;
}
