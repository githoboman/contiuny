import { ContentInfo, ContentMetadata } from '../types';
export declare class ContentService {
    private stacksService;
    constructor();
    /**
     * Register new content with STX pricing only
     */
    registerContent(creator: string, ipfsHash: string, priceStx: number, metadataUri: string): Promise<{
        contentId: number;
        txId: string;
    }>;
    /**
     * Register new content with both STX and token pricing
     */
    registerContentWithToken(creator: string, ipfsHash: string, priceStx: number, priceToken: number, tokenContract: string, metadataUri: string): Promise<{
        contentId: number;
        txId: string;
    }>;
    /**
     * Get content information by ID
     */
    getContentInfo(contentId: number): Promise<ContentMetadata | null>;
    /**
     * Update content price (STX only)
     */
    updateContentPrice(creator: string, contentId: number, newPrice: number): Promise<{
        success: boolean;
        txId: string;
    }>;
    /**
     * Deactivate content
     */
    deactivateContent(creator: string, contentId: number): Promise<{
        success: boolean;
        txId: string;
    }>;
    /**
     * Reactivate content
     */
    reactivateContent(creator: string, contentId: number): Promise<{
        success: boolean;
        txId: string;
    }>;
    /**
     * Get all content by creator
     */
    getCreatorContent(creator: string): Promise<ContentInfo[]>;
    /**
     * Get total content count
     */
    getTotalContentCount(): Promise<number>;
    /**
     * Check if content is active
     */
    isContentActive(contentId: number): Promise<boolean>;
    /**
     * Get all active content (paginated)
     */
    getAllActiveContent(page?: number, limit?: number): Promise<{
        content: ContentInfo[];
        total: number;
        page: number;
        limit: number;
    }>;
}
//# sourceMappingURL=contentService.d.ts.map