"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contentService_1 = require("../services/contentService");
const router = (0, express_1.Router)();
const contentService = new contentService_1.ContentService();
/**
 * POST /api/content
 * Register new content
 */
router.post('/', async (req, res) => {
    try {
        const { creator, ipfsHash, priceStx, priceToken, tokenContract, metadataUri } = req.body;
        // Validation
        if (!creator || !ipfsHash || !priceStx || !metadataUri) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: creator, ipfsHash, priceStx, metadataUri'
            });
        }
        let result;
        // Register with token if token details provided
        if (priceToken && tokenContract) {
            result = await contentService.registerContentWithToken(creator, ipfsHash, priceStx, priceToken, tokenContract, metadataUri);
        }
        else {
            result = await contentService.registerContent(creator, ipfsHash, priceStx, metadataUri);
        }
        res.status(201).json({
            success: true,
            data: result,
            message: 'Content registered successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to register content'
        });
    }
});
/**
 * GET /api/content/:id
 * Get content details by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const contentId = parseInt(req.params.id);
        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            });
        }
        const metadata = await contentService.getContentInfo(contentId);
        if (!metadata) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            });
        }
        res.json({
            success: true,
            data: { contentId, metadata }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get content'
        });
    }
});
/**
 * GET /api/content
 * Get all active content (paginated)
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await contentService.getAllActiveContent(page, limit);
        res.json({
            success: true,
            data: result.content,
            total: result.total,
            page: result.page,
            limit: result.limit
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get content'
        });
    }
});
/**
 * PUT /api/content/:id/price
 * Update content price
 */
router.put('/:id/price', async (req, res) => {
    try {
        const contentId = parseInt(req.params.id);
        const { creator, newPrice } = req.body;
        if (isNaN(contentId) || !creator || !newPrice) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: creator, newPrice'
            });
        }
        const result = await contentService.updateContentPrice(creator, contentId, newPrice);
        res.json({
            success: true,
            data: result,
            message: 'Price updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update price'
        });
    }
});
/**
 * DELETE /api/content/:id
 * Deactivate content
 */
router.delete('/:id', async (req, res) => {
    try {
        const contentId = parseInt(req.params.id);
        const { creator } = req.body;
        if (isNaN(contentId) || !creator) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: creator'
            });
        }
        const result = await contentService.deactivateContent(creator, contentId);
        res.json({
            success: true,
            data: result,
            message: 'Content deactivated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to deactivate content'
        });
    }
});
/**
 * POST /api/content/:id/reactivate
 * Reactivate content
 */
router.post('/:id/reactivate', async (req, res) => {
    try {
        const contentId = parseInt(req.params.id);
        const { creator } = req.body;
        if (isNaN(contentId) || !creator) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: creator'
            });
        }
        const result = await contentService.reactivateContent(creator, contentId);
        res.json({
            success: true,
            data: result,
            message: 'Content reactivated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reactivate content'
        });
    }
});
/**
 * GET /api/content/creator/:address
 * Get all content by creator
 */
router.get('/creator/:address', async (req, res) => {
    try {
        const creator = req.params.address;
        const content = await contentService.getCreatorContent(creator);
        res.json({
            success: true,
            data: content
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get creator content'
        });
    }
});
/**
 * GET /api/content/:id/status
 * Check if content is active
 */
router.get('/:id/status', async (req, res) => {
    try {
        const contentId = parseInt(req.params.id);
        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            });
        }
        const isActive = await contentService.isContentActive(contentId);
        res.json({
            success: true,
            data: { contentId, isActive }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check content status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=content.routes.js.map