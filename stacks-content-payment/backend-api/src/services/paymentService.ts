import { StacksService } from './stacksService';
import { PaymentReceipt, UserAccess } from '../types';

export class PaymentService {
    private stacksService: StacksService;

    constructor() {
        this.stacksService = new StacksService();
    }

    /**
     * Process STX payment for content
     */
    async processStxPayment(
        user: string,
        contentId: number
    ): Promise<{ success: boolean; txId: string; receiptId?: number }> {
        try {
            const result = await this.stacksService.payForContentStx(user, contentId);
            return result;
        } catch (error) {
            throw new Error(`Failed to process STX payment: ${error}`);
        }
    }

    /**
     * Process SIP-010 token payment for content
     */
    async processTokenPayment(
        user: string,
        contentId: number,
        tokenContract: string
    ): Promise<{ success: boolean; txId: string; receiptId?: number }> {
        try {
            const result = await this.stacksService.payForContentToken(
                user,
                contentId,
                tokenContract
            );
            return result;
        } catch (error) {
            throw new Error(`Failed to process token payment: ${error}`);
        }
    }

    /**
     * Verify if user has paid for content
     */
    async verifyPayment(user: string, contentId: number): Promise<boolean> {
        try {
            return await this.stacksService.hasAccess(user, contentId);
        } catch (error) {
            throw new Error(`Failed to verify payment: ${error}`);
        }
    }

    /**
     * Get user's access details for content
     */
    async getUserAccess(user: string, contentId: number): Promise<UserAccess | null> {
        try {
            return await this.stacksService.getUserAccess(user, contentId);
        } catch (error) {
            throw new Error(`Failed to get user access: ${error}`);
        }
    }

    /**
     * Verify access with expiration check
     */
    async verifyAccessWithExpiration(user: string, contentId: number): Promise<boolean> {
        try {
            return await this.stacksService.verifyAccess(user, contentId);
        } catch (error) {
            throw new Error(`Failed to verify access: ${error}`);
        }
    }

    /**
     * Get payment receipt by ID
     */
    async getPaymentReceipt(receiptId: number): Promise<PaymentReceipt | null> {
        try {
            return await this.stacksService.getPaymentReceipt(receiptId);
        } catch (error) {
            throw new Error(`Failed to get payment receipt: ${error}`);
        }
    }

    /**
     * Get total number of receipts
     */
    async getTotalReceipts(): Promise<number> {
        try {
            return await this.stacksService.getTotalReceipts();
        } catch (error) {
            throw new Error(`Failed to get total receipts: ${error}`);
        }
    }

    /**
     * Get all payments for a user (by checking all content)
     */
    async getUserPayments(user: string): Promise<Array<{
        contentId: number;
        access: UserAccess;
    }>> {
        try {
            const payments: Array<{ contentId: number; access: UserAccess }> = [];

            // This is a simplified version - in production, you'd want to index this data
            // For now, we'll check a reasonable range of content IDs
            const maxContentId = 100; // Adjust based on your needs

            for (let contentId = 1; contentId <= maxContentId; contentId++) {
                const access = await this.getUserAccess(user, contentId);
                if (access) {
                    payments.push({ contentId, access });
                }
            }

            return payments;
        } catch (error) {
            throw new Error(`Failed to get user payments: ${error}`);
        }
    }

    /**
     * Get payment statistics for a user
     */
    async getUserPaymentStats(user: string): Promise<{
        totalPayments: number;
        totalSpent: number;
        activeAccess: number;
    }> {
        try {
            const payments = await this.getUserPayments(user);

            let totalSpent = 0;
            let activeAccess = 0;

            for (const payment of payments) {
                totalSpent += payment.access.paidAmount;

                // Check if access is still active
                const isActive = await this.verifyAccessWithExpiration(user, payment.contentId);
                if (isActive) {
                    activeAccess++;
                }
            }

            return {
                totalPayments: payments.length,
                totalSpent,
                activeAccess
            };
        } catch (error) {
            throw new Error(`Failed to get user payment stats: ${error}`);
        }
    }

    /**
     * Get creator's revenue statistics
     */
    async getCreatorRevenue(creator: string): Promise<{
        totalSales: number;
        totalRevenue: number;
        contentCount: number;
        earnings: {
            totalStx: number;
            totalUsdcx: number;
        }
    }> {
        try {
            // Get earnings from payment store
            const { paymentStore } = await import('./paymentStore');
            const earnings = paymentStore.getCreatorEarnings(creator);
            const contentCount = await this.stacksService.getCreatorContentCount(creator);

            return {
                totalSales: earnings.paymentCount,
                totalRevenue: 0, // Legacy field, usage deprecated in favor of earnings object
                contentCount: contentCount,
                earnings: {
                    totalStx: earnings.totalStx,
                    totalUsdcx: earnings.totalUsdcx
                }
            };
        } catch (error) {
            throw new Error(`Failed to get creator revenue: ${error}`);
        }
    }
}
