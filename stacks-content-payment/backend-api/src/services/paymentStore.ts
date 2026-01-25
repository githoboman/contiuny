import fs from 'fs';
import path from 'path';

// Simple payment tracking with JSON persistence
// In production, this would be a real database

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

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'payments.json');

class PaymentStore {
    private payments: Map<number, Payment> = new Map();
    private nextId: number = 1;
    private userAccess: Map<string, Set<number>> = new Map(); // user -> contentIds

    constructor() {
        this.loadData();
    }

    private loadData() {
        try {
            // Ensure data directory exists
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }

            if (fs.existsSync(DATA_FILE)) {
                const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
                const data = JSON.parse(rawData);

                if (Array.isArray(data)) {
                    this.payments = new Map();
                    this.userAccess = new Map();
                    let maxId = 0;

                    data.forEach((item: any) => {
                        // Rehydrate dates
                        item.timestamp = new Date(item.timestamp);
                        this.payments.set(item.paymentId, item);

                        // Rebuild user access index
                        if (!this.userAccess.has(item.buyer)) {
                            this.userAccess.set(item.buyer, new Set());
                        }
                        this.userAccess.get(item.buyer)!.add(item.contentId);

                        if (item.paymentId > maxId) maxId = item.paymentId;
                    });

                    this.nextId = maxId + 1;
                    console.log(`✅ Loaded ${this.payments.size} payments from storage`);
                }
            }
        } catch (error) {
            console.error('Failed to load payment data:', error);
        }
    }

    private saveData() {
        try {
            const data = Array.from(this.payments.values());
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save payment data:', error);
        }
    }

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
        this.saveData();

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

    getCreatorPayments(creator: string): Payment[] {
        return Array.from(this.payments.values())
            .filter(p => p.creator === creator)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Newest first
    }

    getUserPayments(user: string): Payment[] {
        return Array.from(this.payments.values())
            .filter(p => p.buyer === user)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
}

export const paymentStore = new PaymentStore();
