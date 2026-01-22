// Simple payment tracking for demo purposes

interface Payment {
    paymentId: number;
    contentId: number;
    buyer: string;
    creator: string;
    amount: number;
    currency: 'STX' | 'USDCx';
    timestamp: Date;
    txId: string;
}

class PaymentStore {
    private payments: Map<number, Payment> = new Map();
    private nextId: number = 1;
    private userAccess: Map<string, Set<number>> = new Map(); // user -> contentIds

    recordPayment(data: Omit<Payment, 'paymentId' | 'timestamp'>): number {
        const paymentId = this.nextId++;
        const payment: Payment = {
            ...data,
            paymentId,
            timestamp: new Date()
        };

        this.payments.set(paymentId, payment);

        // Grant access
        if (!this.userAccess.has(data.buyer)) {
            this.userAccess.set(data.buyer, new Set());
        }
        this.userAccess.get(data.buyer)!.add(data.contentId);

        console.log(`💰 Payment recorded: ${data.buyer} paid ${data.amount} ${data.currency} for content #${data.contentId}`);

        return paymentId;
    }

    hasAccess(user: string, contentId: number): boolean {
        return this.userAccess.get(user)?.has(contentId) || false;
    }

    getCreatorEarnings(creator: string): { totalStx: number; totalUsdcx: number; paymentCount: number } {
        let totalStx = 0;
        let totalUsdcx = 0;
        let paymentCount = 0;

        for (const payment of this.payments.values()) {
            if (payment.creator === creator) {
                if (payment.currency === 'STX') {
                    totalStx += payment.amount;
                } else {
                    totalUsdcx += payment.amount;
                }
                paymentCount++;
            }
        }

        return { totalStx, totalUsdcx, paymentCount };
    }

    getUserPayments(user: string): Payment[] {
        return Array.from(this.payments.values())
            .filter(p => p.buyer === user);
    }
}

export const paymentStore = new PaymentStore();
