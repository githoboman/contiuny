// Simple in-memory storage for demo purposes
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

class ContentStore {
    private contents: Map<number, StoredContent> = new Map();
    private nextId: number = 1;

    constructor() {
        // Add sample content for demo
        this.initializeSampleContent();
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

        console.log('✅ Initialized with 2 sample content items');
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
        return true;
    }

    getTotalCount(): number {
        return Array.from(this.contents.values()).filter(c => c.isActive).length;
    }
}

export const contentStore = new ContentStore();
