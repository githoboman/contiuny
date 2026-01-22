import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { paymentStore } from '../services/paymentStore';
import { ApiResponse } from '../types';

const router = Router();
const paymentService = new PaymentService();

/**
 * POST /api/payment/stx
 * Process STX payment for content
 */
router.post('/stx', async (req: Request, res: Response) => {
    try {
        const { user, contentId, txId } = req.body;

        if (!user || !contentId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: user, contentId'
            } as ApiResponse<null>);
        }

        // Get content to find creator and price
        const { contentStore } = await import('../services/contentStore');
        const content = contentStore.getContent(contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            } as ApiResponse<null>);
        }

        // Record payment in demo store
        const paymentId = paymentStore.recordPayment({
            contentId,
            buyer: user,
            creator: content.creator,
            amount: content.priceStx,
            currency: 'STX',
            txId: txId || `demo-${Date.now()}`
        });

        res.status(201).json({
            success: true,
            data: {
                success: true,
                txId: txId || `demo-${Date.now()}`,
                receiptId: paymentId
            },
            message: 'STX payment processed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process STX payment'
        } as ApiResponse<null>);
    }
});

/**
 * POST /api/payment/token
 * Process SIP-010 token payment for content
 */
router.post('/token', async (req: Request, res: Response) => {
    try {
        const { user, contentId, tokenContract } = req.body;

        if (!user || !contentId || !tokenContract) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: user, contentId, tokenContract'
            } as ApiResponse<null>);
        }

        const result = await paymentService.processTokenPayment(user, contentId, tokenContract);

        res.status(201).json({
            success: true,
            data: result,
            message: 'Token payment processed successfully'
        } as ApiResponse<typeof result>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process token payment'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/payment/verify/:contentId/:user
 * Verify if user has paid for content
 */
router.get('/verify/:contentId/:user', async (req: Request, res: Response) => {
    try {
        const contentId = parseInt(req.params.contentId);
        const user = req.params.user;

        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            } as ApiResponse<null>);
        }

        const hasPaid = paymentStore.hasAccess(user, contentId);

        res.json({
            success: true,
            data: { contentId, user, hasPaid }
        } as ApiResponse<{ contentId: number; user: string; hasPaid: boolean }>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify payment'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/payment/access/:contentId/:user
 * Get user's access details for content
 */
router.get('/access/:contentId/:user', async (req: Request, res: Response) => {
    try {
        const contentId = parseInt(req.params.contentId);
        const user = req.params.user;

        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            } as ApiResponse<null>);
        }

        const access = await paymentService.getUserAccess(user, contentId);

        if (!access) {
            return res.status(404).json({
                success: false,
                error: 'No access found for this user and content'
            } as ApiResponse<null>);
        }

        res.json({
            success: true,
            data: access
        } as ApiResponse<typeof access>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get access details'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/payment/receipt/:id
 * Get payment receipt by ID
 */
router.get('/receipt/:id', async (req: Request, res: Response) => {
    try {
        const receiptId = parseInt(req.params.id);

        if (isNaN(receiptId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid receipt ID'
            } as ApiResponse<null>);
        }

        const receipt = await paymentService.getPaymentReceipt(receiptId);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                error: 'Receipt not found'
            } as ApiResponse<null>);
        }

        res.json({
            success: true,
            data: receipt
        } as ApiResponse<typeof receipt>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get receipt'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/payment/user/:address
 * Get all payments for a user
 */
router.get('/user/:address', async (req: Request, res: Response) => {
    try {
        const user = req.params.address;

        const payments = await paymentService.getUserPayments(user);

        res.json({
            success: true,
            data: payments
        } as ApiResponse<typeof payments>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get user payments'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/payment/user/:address/stats
 * Get payment statistics for a user
 */
router.get('/user/:address/stats', async (req: Request, res: Response) => {
    try {
        const user = req.params.address;

        const stats = await paymentService.getUserPaymentStats(user);

        res.json({
            success: true,
            data: stats
        } as ApiResponse<typeof stats>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get payment stats'
        } as ApiResponse<null>);
    }
});

/**
 * GET /api/payment/creator/:address/revenue
 * Get creator's revenue statistics
 */
router.get('/creator/:address/revenue', async (req: Request, res: Response) => {
    try {
        const creator = req.params.address;

        const revenue = await paymentService.getCreatorRevenue(creator);

        res.json({
            success: true,
            data: revenue
        } as ApiResponse<typeof revenue>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get creator revenue'
        } as ApiResponse<null>);
    }
});

export default router;
