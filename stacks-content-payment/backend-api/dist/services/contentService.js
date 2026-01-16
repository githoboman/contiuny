"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const stacksService_1 = require("./stacksService");
class ContentService {
    constructor() {
        this.stacksService = new stacksService_1.StacksService();
    }
    /**
     * Register new content with STX pricing only
     */
    async registerContent(creator, ipfsHash, priceStx, metadataUri) {
        try {
            const result = await this.stacksService.registerContent(creator, ipfsHash, priceStx, metadataUri);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to register content: ${error}`);
        }
    }
    /**
     * Register new content with both STX and token pricing
     */
    async registerContentWithToken(creator, ipfsHash, priceStx, priceToken, tokenContract, metadataUri) {
        try {
            const result = await this.stacksService.registerContentWithToken(creator, ipfsHash, priceStx, priceToken, tokenContract, metadataUri);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to register content with token: ${error}`);
        }
    }
    /**
     * Get content information by ID
     */
    async getContentInfo(contentId) {
        try {
            const info = await this.stacksService.getContentInfo(contentId);
            return info;
        }
        catch (error) {
            throw new Error(`Failed to get content info: ${error}`);
        }
    }
    /**
     * Update content price (STX only)
     */
    async updateContentPrice(creator, contentId, newPrice) {
        try {
            const result = await this.stacksService.updateContentPrice(creator, contentId, newPrice);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to update content price: ${error}`);
        }
    }
    /**
     * Deactivate content
     */
    async deactivateContent(creator, contentId) {
        try {
            const result = await this.stacksService.deactivateContent(creator, contentId);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to deactivate content: ${error}`);
        }
    }
    /**
     * Reactivate content
     */
    async reactivateContent(creator, contentId) {
        try {
            const result = await this.stacksService.reactivateContent(creator, contentId);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to reactivate content: ${error}`);
        }
    }
    /**
     * Get all content by creator
     */
    async getCreatorContent(creator) {
        try {
            // Get creator's content count
            const count = await this.stacksService.getCreatorContentCount(creator);
            const contentList = [];
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
        }
        catch (error) {
            throw new Error(`Failed to get creator content: ${error}`);
        }
    }
    /**
     * Get total content count
     */
    async getTotalContentCount() {
        try {
            return await this.stacksService.getTotalContentCount();
        }
        catch (error) {
            throw new Error(`Failed to get total content count: ${error}`);
        }
    }
    /**
     * Check if content is active
     */
    async isContentActive(contentId) {
        try {
            return await this.stacksService.isContentActive(contentId);
        }
        catch (error) {
            throw new Error(`Failed to check content status: ${error}`);
        }
    }
    /**
     * Get all active content (paginated)
     */
    async getAllActiveContent(page = 1, limit = 20) {
        try {
            const totalCount = await this.getTotalContentCount();
            const allContent = [];
            // Fetch all content
            for (let i = 1; i <= totalCount; i++) {
                const metadata = await this.getContentInfo(i);
                if (metadata && metadata.isActive) {
                    allContent.push({ contentId: i, metadata });
                }
            }
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
        }
        catch (error) {
            throw new Error(`Failed to get active content: ${error}`);
        }
    }
}
exports.ContentService = ContentService;
//# sourceMappingURL=contentService.js.map