import crypto from 'crypto';

export class IpfsService {
    private ipfsGateway: string;
    private pinataApiKey?: string;
    private pinataSecretKey?: string;

    constructor() {
        this.ipfsGateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
        this.pinataApiKey = process.env.PINATA_API_KEY;
        this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    }

    /**
     * Generate IPFS hash for content (simulated for now)
     * In production, this would upload to IPFS via Pinata
     */
    generateIpfsHash(content: string): string {
        // Generate a deterministic hash from content
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        return `Qm${hash.substring(0, 44)}`; // IPFS hashes start with Qm
    }

    /**
     * Upload content to IPFS via Pinata
     * Currently returns a mock hash - implement when Pinata keys are provided
     */
    async uploadToPinata(
        content: any,
        metadata?: { name?: string; keyvalues?: Record<string, any> }
    ): Promise<{ ipfsHash: string; pinSize: number }> {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            // Mock upload for development
            const mockHash = this.generateIpfsHash(JSON.stringify(content));
            return {
                ipfsHash: mockHash,
                pinSize: JSON.stringify(content).length
            };
        }

        try {
            // Real Pinata upload would go here
            // const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'pinata_api_key': this.pinataApiKey,
            //     'pinata_secret_api_key': this.pinataSecretKey
            //   },
            //   body: JSON.stringify({
            //     pinataContent: content,
            //     pinataMetadata: metadata
            //   })
            // });

            throw new Error('Pinata upload not yet implemented - provide API keys');
        } catch (error) {
            throw new Error(`Failed to upload to Pinata: ${error}`);
        }
    }

    /**
     * Get content from IPFS
     */
    async getFromIPFS(ipfsHash: string): Promise<any> {
        try {
            const url = `${this.ipfsGateway}${ipfsHash}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`IPFS gateway returned ${response.status}`);
            }

            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            throw new Error(`Failed to fetch from IPFS: ${error}`);
        }
    }

    /**
     * Get IPFS gateway URL for a hash
     */
    getGatewayUrl(ipfsHash: string): string {
        return `${this.ipfsGateway}${ipfsHash}`;
    }

    /**
     * Pin content to IPFS (requires Pinata)
     */
    async pinContent(ipfsHash: string): Promise<boolean> {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            console.warn('Pinata credentials not configured - skipping pin');
            return false;
        }

        try {
            // Pinata pin by hash would go here
            throw new Error('Pin by hash not yet implemented');
        } catch (error) {
            throw new Error(`Failed to pin content: ${error}`);
        }
    }

    /**
     * Unpin content from IPFS (requires Pinata)
     */
    async unpinContent(ipfsHash: string): Promise<boolean> {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            console.warn('Pinata credentials not configured - skipping unpin');
            return false;
        }

        try {
            // Pinata unpin would go here
            throw new Error('Unpin not yet implemented');
        } catch (error) {
            throw new Error(`Failed to unpin content: ${error}`);
        }
    }

    /**
     * Validate IPFS hash format
     */
    isValidIpfsHash(hash: string): boolean {
        // Basic validation for IPFS CIDv0 (Qm...)
        const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
        return ipfsHashRegex.test(hash);
    }

    /**
     * Create metadata object for content
     */
    createMetadata(options: {
        title: string;
        description?: string;
        creator: string;
        price: number;
        category?: string;
        tags?: string[];
    }): object {
        return {
            name: options.title,
            description: options.description || '',
            creator: options.creator,
            price: options.price,
            category: options.category || 'general',
            tags: options.tags || [],
            createdAt: new Date().toISOString(),
            version: '1.0'
        };
    }
}
