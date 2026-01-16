import { PaymentReceipt, UserAccess } from '../types';
export declare class PaymentService {
    private stacksService;
    constructor();
    /**
     * Process STX payment for content
     */
    processStxPayment(user: string, contentId: number): Promise<{
        success: boolean;
        txId: string;
        receiptId?: number;
    }>;
    /**
     * Process SIP-010 token payment for content
     */
    processTokenPayment(user: string, contentId: number, tokenContract: string): Promise<{
        success: boolean;
        txId: string;
        receiptId?: number;
    }>;
    /**
     * Verify if user has paid for content
     */
    verifyPayment(user: string, contentId: number): Promise<boolean>;
    /**
     * Get user's access details for content
     */
    getUserAccess(user: string, contentId: number): Promise<UserAccess | null>;
    /**
     * Verify access with expiration check
     */
    verifyAccessWithExpiration(user: string, contentId: number): Promise<boolean>;
    /**
     * Get payment receipt by ID
     */
    getPaymentReceipt(receiptId: number): Promise<PaymentReceipt | null>;
    /**
     * Get total number of receipts
     */
    getTotalReceipts(): Promise<number>;
    /**
     * Get all payments for a user (by checking all content)
     */
    getUserPayments(user: string): Promise<Array<{
        contentId: number;
        access: UserAccess;
    }>>;
    /**
     * Get payment statistics for a user
     */
    getUserPaymentStats(user: string): Promise<{
        totalPayments: number;
        totalSpent: number;
        activeAccess: number;
    }>;
    /**
     * Get creator's revenue statistics
     */
    getCreatorRevenue(creator: string): Promise<{
        totalSales: number;
        totalRevenue: number;
        contentCount: number;
    }>;
}
//# sourceMappingURL=paymentService.d.ts.map