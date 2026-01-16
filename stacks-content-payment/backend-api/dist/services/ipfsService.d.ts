export declare class IpfsService {
    private ipfsGateway;
    private pinataApiKey?;
    private pinataSecretKey?;
    constructor();
    /**
     * Generate IPFS hash for content (simulated for now)
     * In production, this would upload to IPFS via Pinata
     */
    generateIpfsHash(content: string): string;
    /**
     * Upload content to IPFS via Pinata
     * Currently returns a mock hash - implement when Pinata keys are provided
     */
    uploadToPinata(content: any, metadata?: {
        name?: string;
        keyvalues?: Record<string, any>;
    }): Promise<{
        ipfsHash: string;
        pinSize: number;
    }>;
    /**
     * Get content from IPFS
     */
    getFromIPFS(ipfsHash: string): Promise<any>;
    /**
     * Get IPFS gateway URL for a hash
     */
    getGatewayUrl(ipfsHash: string): string;
    /**
     * Pin content to IPFS (requires Pinata)
     */
    pinContent(ipfsHash: string): Promise<boolean>;
    /**
     * Unpin content from IPFS (requires Pinata)
     */
    unpinContent(ipfsHash: string): Promise<boolean>;
    /**
     * Validate IPFS hash format
     */
    isValidIpfsHash(hash: string): boolean;
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
    }): object;
}
//# sourceMappingURL=ipfsService.d.ts.map