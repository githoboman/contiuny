import fs from 'fs';
import path from 'path';

// Simple in-memory storage with JSON persistence for demo purposes
// In production, this would be a real database

interface StoredContent {
    contentId: number;
    creator: string;
    ipfsHash: string;
    priceStx: number;
    metadataUri: string;
    priceToken?: number;
    tokenContract?: string;
    createdAt: Date;
    isActive: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');

class ContentStore {
    private contents: Map<number, StoredContent> = new Map();
    private nextId: number = 1;

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
                    this.contents = new Map();
                    let maxId = 0;

                    data.forEach((item: any) => {
                        // Rehydrate dates
                        item.createdAt = new Date(item.createdAt);
                        this.contents.set(item.contentId, item);
                        if (item.contentId > maxId) maxId = item.contentId;
                    });

                    this.nextId = maxId + 1;
                    console.log(`✅ Loaded ${this.contents.size} content items from storage`);
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to load data, starting fresh:', error);
        }

        // If load failed or no file, initialize samples
        this.initializeSampleContent();
    }

    private saveData() {
        try {
            const data = Array.from(this.contents.values());
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    private initializeSampleContent() {
        // Sample content 1
        this.addContent({
            creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            priceStx: 500000, // 0.5 STX
            metadataUri: 'https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            priceToken: 100, // $1.00
            tokenContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx'
        });

        // Sample content 2
        this.addContent({
            creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            ipfsHash: 'QmPtAet3F8axXGts5UKPtf6mJ4RGiz4o29EKpxkEVtMadG',
            priceStx: 1000000, // 1 STX
            metadataUri: 'https://gateway.pinata.cloud/ipfs/QmPtAet3F8axXGts5UKPtf6mJ4RGiz4o29EKpxkEVtMadG'
        });

        console.log('✅ Initialized with sample content');
    }

    addContent(data: Omit<StoredContent, 'contentId' | 'createdAt' | 'isActive'>): number {
        const contentId = this.nextId++;
        const content: StoredContent = {
            ...data,
            contentId,
            createdAt: new Date(),
            isActive: true
        };
        this.contents.set(contentId, content);
        console.log(`✅ Stored content #${contentId}:`, content);
        this.saveData();
        return contentId;
    }

    getContent(contentId: number): StoredContent | undefined {
        return this.contents.get(contentId);
    }

    getAllContent(): StoredContent[] {
        return Array.from(this.contents.values());
    }

    getContentByCreator(creator: string): StoredContent[] {
        return Array.from(this.contents.values())
            .filter(content => content.creator === creator);
    }

    deleteContent(contentId: number, creator: string): boolean {
        const content = this.contents.get(contentId);
        if (!content) {
            return false;
        }

        // Only allow creator to delete their own content
        if (content.creator !== creator) {
            throw new Error('Unauthorized: Only the creator can delete this content');
        }

        this.contents.delete(contentId);
        console.log(`🗑️ Content #${contentId} deleted by creator`);
        this.saveData();
        return true;
    }

    deactivateContent(contentId: number, creator: string): boolean {
        const content = this.contents.get(contentId);
        if (!content) {
            return false;
        }

        // Only allow creator to deactivate their own content
        if (content.creator !== creator) {
            throw new Error('Unauthorized: Only the creator can deactivate this content');
        }

        content.isActive = false;
        console.log(`⏸️ Content #${contentId} deactivated by creator`);
        this.saveData();
        return true;
    }

    getTotalCount(): number {
        return Array.from(this.contents.values()).filter(c => c.isActive).length;
    }
}

export const contentStore = new ContentStore();
