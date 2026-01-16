"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentService_1 = require("../services/paymentService");
const router = (0, express_1.Router)();
const paymentService = new paymentService_1.PaymentService();
/**
 * POST /api/payment/stx
 * Process STX payment for content
 */
router.post('/stx', async (req, res) => {
    try {
        const { user, contentId } = req.body;
        if (!user || !contentId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: user, contentId'
            });
        }
        const result = await paymentService.processStxPayment(user, contentId);
        res.status(201).json({
            success: true,
            data: result,
            message: 'STX payment processed successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process STX payment'
        });
    }
});
/**
 * POST /api/payment/token
 * Process SIP-010 token payment for content
 */
router.post('/token', async (req, res) => {
    try {
        const { user, contentId, tokenContract } = req.body;
        if (!user || !contentId || !tokenContract) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: user, contentId, tokenContract'
            });
        }
        const result = await paymentService.processTokenPayment(user, contentId, tokenContract);
        res.status(201).json({
            success: true,
            data: result,
            message: 'Token payment processed successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process token payment'
        });
    }
});
/**
 * GET /api/payment/verify/:contentId/:user
 * Verify if user has paid for content
 */
router.get('/verify/:contentId/:user', async (req, res) => {
    try {
        const contentId = parseInt(req.params.contentId);
        const user = req.params.user;
        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            });
        }
        const hasPaid = await paymentService.verifyPayment(user, contentId);
        res.json({
            success: true,
            data: { contentId, user, hasPaid }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify payment'
        });
    }
});
/**
 * GET /api/payment/access/:contentId/:user
 * Get user's access details for content
 */
router.get('/access/:contentId/:user', async (req, res) => {
    try {
        const contentId = parseInt(req.params.contentId);
        const user = req.params.user;
        if (isNaN(contentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content ID'
            });
        }
        const access = await paymentService.getUserAccess(user, contentId);
        if (!access) {
            return res.status(404).json({
                success: false,
                error: 'No access found for this user and content'
            });
        }
        res.json({
            success: true,
            data: access
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get access details'
        });
    }
});
/**
 * GET /api/payment/receipt/:id
 * Get payment receipt by ID
 */
router.get('/receipt/:id', async (req, res) => {
    try {
        const receiptId = parseInt(req.params.id);
        if (isNaN(receiptId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid receipt ID'
            });
        }
        const receipt = await paymentService.getPaymentReceipt(receiptId);
        if (!receipt) {
            return res.status(404).json({
                success: false,
                error: 'Receipt not found'
            });
        }
        res.json({
            success: true,
            data: receipt
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get receipt'
        });
    }
});
/**
 * GET /api/payment/user/:address
 * Get all payments for a user
 */
router.get('/user/:address', async (req, res) => {
    try {
        const user = req.params.address;
        const payments = await paymentService.getUserPayments(user);
        res.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get user payments'
        });
    }
});
/**
 * GET /api/payment/user/:address/stats
 * Get payment statistics for a user
 */
router.get('/user/:address/stats', async (req, res) => {
    try {
        const user = req.params.address;
        const stats = await paymentService.getUserPaymentStats(user);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get payment stats'
        });
    }
});
/**
 * GET /api/payment/creator/:address/revenue
 * Get creator's revenue statistics
 */
router.get('/creator/:address/revenue', async (req, res) => {
    try {
        const creator = req.params.address;
        const revenue = await paymentService.getCreatorRevenue(creator);
        res.json({
            success: true,
            data: revenue
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get creator revenue'
        });
    }
});
exports.default = router;
//# sourceMappingURL=payment.routes.js.map