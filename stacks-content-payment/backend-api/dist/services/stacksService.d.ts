export declare class StacksService {
    private network;
    private contentRegistryAddress;
    private paymentHandlerAddress;
    private accessControlAddress;
    constructor(isMainnet?: boolean);
    /**
     * Register new content on the blockchain
     */
    registerContent(creatorKey: string, ipfsHash: string, price: number, metadataUri: string): Promise<{
        contentId: number;
        txId: string;
    }>;
    /**
     * Process STX payment for content
     */
    payForContent(userKey: string, userAddress: string, contentId: number, price: number): Promise<import("@stacks/transactions").TxBroadcastResult>;
    /**
     * Check if user has access to content
     */
    checkAccess(userAddress: string, contentId: number): Promise<boolean>;
    /**
     * Get content information
     */
    getContentInfo(contentId: number, callerAddress?: string): Promise<any>;
    /**
     * Get content price
     */
    getContentPrice(contentId: number, callerAddress: string): Promise<number | null>;
    /**
     * Update content price (creator only)
     */
    updatePrice(creatorKey: string, contentId: number, newPrice: number): Promise<{
        success: boolean;
        txId: string;
    }>;
    /**
     * Deactivate content (creator only)
     */
    deactivateContent(creatorKey: string, contentId: number): Promise<{
        success: boolean;
        txId: string;
    }>;
    /**
     * Get user access details
     */
    getUserAccess(userAddress: string, contentId: number): Promise<any>;
    /**
     * Monitor transaction status
     */
    getTransactionStatus(txId: string): Promise<unknown>;
    /**
     * Get creator's content count
     */
    getCreatorContentCount(creatorAddress: string, callerAddress?: string): Promise<number>;
    getTotalContentCount(): Promise<number>;
    getCreatorContentByIndex(creator: string, index: number): Promise<number | null>;
    isContentActive(contentId: number): Promise<boolean>;
    registerContentWithToken(creator: string, ipfsHash: string, priceStx: number, priceToken: number, tokenContract: string, metadataUri: string): Promise<{
        contentId: number;
        txId: string;
    }>;
    updateContentPrice(creator: string, contentId: number, newPrice: number): Promise<{
        success: boolean;
        txId: string;
    }>;
    reactivateContent(creator: string, contentId: number): Promise<{
        success: boolean;
        txId: string;
    }>;
    payForContentStx(user: string, contentId: number): Promise<{
        success: boolean;
        txId: string;
        receiptId: number;
    }>;
    payForContentToken(user: string, contentId: number, tokenContract: string): Promise<{
        success: boolean;
        txId: string;
        receiptId: number;
    }>;
    hasAccess(user: string, contentId: number): Promise<boolean>;
    verifyAccess(user: string, contentId: number): Promise<boolean>;
    getPaymentReceipt(receiptId: number): Promise<null>;
    getTotalReceipts(): Promise<number>;
}
//# sourceMappingURL=stacksService.d.ts.map