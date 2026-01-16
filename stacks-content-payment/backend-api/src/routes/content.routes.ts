import { Router, Request, Response } from 'express';
import { ContentService } from '../services/contentService';
import { ApiResponse, PaginatedResponse, ContentInfo } from '../types';
import { validateContentRegistration } from '../middleware/validation.middleware';

const router = Router();
const contentService = new ContentService();

/**
 * POST /api/content
 * Register new content
 */
router.post('/', validateContentRegistration, async (req: Request, res: Response) => {
    try {
        const { creator, ipfsHash, priceStx, priceToken, tokenContract, metadataUri } = req.body;

        // Validation
        if (!creator || !ipfsHash || !priceStx || !metadataUri) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: creator, ipfsHash, priceStx, metadataUri'
            } as ApiResponse<null>);
        }

        let result;

        // Register with token if token details provided
        if (priceToken && tokenContract) {
            result = await contentService.registerContentWithToken(
                creator,
                ipfsHash,
                priceStx,
                priceToken,
                tokenContract,
                metadataUri
            );
        } else {
            result = await contentService.registerContent(
                creator,
                ipfsHash,
                priceStx,
                metadataUri
            );
        }

        res.status(201).json({
            success: true,
            data: result,
            message: 'Content registered successfully'
        } as ApiResponse<typeof result>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to register content'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/content/:id
 * Get content details by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const contentId = parseInt(req.params.id);

        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            } as ApiResponse<null>);
        }

        const metadata = await contentService.getContentInfo(contentId);

        if (!metadata) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            } as ApiResponse<null>);
        }

        res.json({
            success: true,
            data: { contentId, metadata }
        } as ApiResponse<ContentInfo>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get content'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/content
 * Get all active content (paginated)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await contentService.getAllActiveContent(page, limit);

        res.json({
            success: true,
            data: result.content,
            total: result.total,
            page: result.page,
            limit: result.limit
        } as PaginatedResponse<ContentInfo>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get content'
        } as ApiResponse<null>);
    }
});

/**
 * PUT /api/content/:id/price
 * Update content price
 */
router.put('/:id/price', async (req: Request, res: Response) => {
    try {
        const contentId = parseInt(req.params.id);
        const { creator, newPrice } = req.body;

        if (isNaN(contentId) || !creator || !newPrice) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: creator, newPrice'
            } as ApiResponse<null>);
        }

        const result = await contentService.updateContentPrice(creator, contentId, newPrice);

        res.json({
            success: true,
            data: result,
            message: 'Price updated successfully'
        } as ApiResponse<typeof result>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update price'
        } as ApiResponse<null>);
    }
});

/**
 * DELETE /api/content/:id
 * Deactivate content
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const contentId = parseInt(req.params.id);
        const { creator } = req.body;

        if (isNaN(contentId) || !creator) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: creator'
            } as ApiResponse<null>);
        }

        const result = await contentService.deactivateContent(creator, contentId);

        res.json({
            success: true,
            data: result,
            message: 'Content deactivated successfully'
        } as ApiResponse<typeof result>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to deactivate content'
        } as ApiResponse<null>);
    }
});

/**
 * POST /api/content/:id/reactivate
 * Reactivate content
 */
router.post('/:id/reactivate', async (req: Request, res: Response) => {
    try {
        const contentId = parseInt(req.params.id);
        const { creator } = req.body;

        if (isNaN(contentId) || !creator) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: creator'
            } as ApiResponse<null>);
        }

        const result = await contentService.reactivateContent(creator, contentId);

        res.json({
            success: true,
            data: result,
            message: 'Content reactivated successfully'
        } as ApiResponse<typeof result>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reactivate content'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/content/creator/:address
 * Get all content by creator
 */
router.get('/creator/:address', async (req: Request, res: Response) => {
    try {
        const creator = req.params.address;

        const content = await contentService.getCreatorContent(creator);

        res.json({
            success: true,
            data: content
        } as ApiResponse<ContentInfo[]>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get creator content'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/content/:id/status
 * Check if content is active
 */
router.get('/:id/status', async (req: Request, res: Response) => {
    try {
        const contentId = parseInt(req.params.id);

        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            } as ApiResponse<null>);
        }

        const isActive = await contentService.isContentActive(contentId);

        res.json({
            success: true,
            data: { contentId, isActive }
        } as ApiResponse<{ contentId: number; isActive: boolean }>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check content status'
        } as ApiResponse<null>);
    }
});

export default router;
