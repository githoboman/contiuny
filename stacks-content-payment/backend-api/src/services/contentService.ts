import { StacksService } from './stacksService';
import { ContentInfo, ContentMetadata } from '../types';
import { contentStore } from './contentStore';

export class ContentService {
    private stacksService: StacksService;

    constructor() {
        this.stacksService = new StacksService();
    }

    /**
     * Register new content with STX pricing only
     */
    async registerContent(
        creator: string,
        ipfsHash: string,
        priceStx: number,
        metadataUri: string
    ): Promise<{ contentId: number; txId: string }> {
        try {
            // Store content in memory
            const contentId = contentStore.addContent({
                creator,
                ipfsHash,
                priceStx,
                metadataUri
            });

            const txId = `tx-${Date.now()}`;

            console.log('✅ Content registered successfully:', {
                contentId,
                creator,
                ipfsHash,
                priceStx,
                metadataUri
            });

            return { contentId, txId };
        } catch (error) {
            throw new Error(`Failed to register content: ${error}`);
        }
    }

    /**
     * Register new content with both STX and token pricing
     */
    async registerContentWithToken(
        creator: string,
        ipfsHash: string,
        priceStx: number,
        priceToken: number,
        tokenContract: string,
        metadataUri: string
    ): Promise<{ contentId: number; txId: string }> {
        try {
            // Store content with token pricing
            const contentId = contentStore.addContent({
                creator,
                ipfsHash,
                priceStx,
                metadataUri,
                priceToken,
                tokenContract
            });

            const txId = `tx-${Date.now()}`;

            console.log('✅ Content with USDCx registered:', { contentId, priceToken, tokenContract });

            return { contentId, txId };
        } catch (error) {
            throw new Error(`Failed to register content with token: ${error}`);
        }
    }

    /**
     * Get content information by ID
     */
    async getContentInfo(contentId: number): Promise<ContentMetadata | null> {
        try {
            const stored = contentStore.getContent(contentId);

            if (!stored) {
                return null;
            }

            // Convert to ContentMetadata format
            return {
                creator: stored.creator,
                ipfsHash: stored.ipfsHash,
                priceStx: stored.priceStx,
                metadataUri: stored.metadataUri,
                priceToken: stored.priceToken,
                tokenContract: stored.tokenContract,
                isActive: stored.isActive,
                createdAt: stored.createdAt.getTime()
            };
        } catch (error) {
            throw new Error(`Failed to get content info: ${error}`);
        }
    }

    /**
     * Update content price (STX only)
     */
    async updateContentPrice(
        creator: string,
        contentId: number,
        newPrice: number
    ): Promise<{ success: boolean; txId: string }> {
        try {
            const result = await this.stacksService.updateContentPrice(
                creator,
                contentId,
                newPrice
            );
            return result;
        } catch (error) {
            throw new Error(`Failed to update content price: ${error}`);
        }
    }

    /**
     * Deactivate content
     */
    async deactivateContent(
        creator: string,
        contentId: number
    ): Promise<{ success: boolean; txId: string }> {
        try {
            const result = await this.stacksService.deactivateContent(creator, contentId);
            return result;
        } catch (error) {
            throw new Error(`Failed to deactivate content: ${error}`);
        }
    }

    /**
     * Reactivate content
     */
    async reactivateContent(
        creator: string,
        contentId: number
    ): Promise<{ success: boolean; txId: string }> {
        try {
            const result = await this.stacksService.reactivateContent(creator, contentId);
            return result;
        } catch (error) {
            throw new Error(`Failed to reactivate content: ${error}`);
        }
    }

    /**
     * Get all content by creator
     */
    async getCreatorContent(creator: string): Promise<ContentInfo[]> {
        try {
            // Get creator's content count
            const count = await this.stacksService.getCreatorContentCount(creator);

            const contentList: ContentInfo[] = [];

            // Fetch each content item
            for (let i = 0; i < count; i++) {
                const contentId = await this.stacksService.getCreatorContentByIndex(creator, i);
                if (contentId) {
                    const metadata = await this.getContentInfo(contentId);
                    if (metadata) {
                        contentList.push({ contentId, metadata });
                    }
                }
            }

            return contentList;
        } catch (error) {
            throw new Error(`Failed to get creator content: ${error}`);
        }
    }

    /**
     * Get total content count
     */
    async getTotalContentCount(): Promise<number> {
        try {
            return await this.stacksService.getTotalContentCount();
        } catch (error) {
            throw new Error(`Failed to get total content count: ${error}`);
        }
    }

    /**
     * Check if content is active
     */
    async isContentActive(contentId: number): Promise<boolean> {
        try {
            return await this.stacksService.isContentActive(contentId);
        } catch (error) {
            throw new Error(`Failed to check content status: ${error}`);
        }
    }

    /**
     * Get all active content (paginated)
     */
    async getAllActiveContent(page: number = 1, limit: number = 20): Promise<{
        content: ContentInfo[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            // Get all content from store
            const allStoredContent = contentStore.getAllContent();

            // Convert to ContentInfo format
            const allContent: ContentInfo[] = allStoredContent.map(stored => ({
                contentId: stored.contentId,
                metadata: {
                    creator: stored.creator,
                    ipfsHash: stored.ipfsHash,
                    priceStx: stored.priceStx,
                    metadataUri: stored.metadataUri,
                    priceToken: stored.priceToken,
                    tokenContract: stored.tokenContract,
                    isActive: stored.isActive,
                    createdAt: stored.createdAt.getTime() // Convert to timestamp
                }
            }));

            // Paginate
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedContent = allContent.slice(startIndex, endIndex);

            return {
                content: paginatedContent,
                total: allContent.length,
                page,
                limit
            };
        } catch (error) {
            throw new Error(`Failed to get active content: ${error}`);
        }
    }
}
