import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

export class UploadService {
    private pinataApiKey: string;
    private pinataSecretKey: string;
    private pinataJWT: string;

    constructor() {
        this.pinataApiKey = process.env.PINATA_API_KEY || '';
        this.pinataSecretKey = process.env.PINATA_SECRET_KEY || '';
        this.pinataJWT = process.env.PINATA_JWT || '';

        console.log('Pinata credentials loaded:');
        console.log('- API Key:', this.pinataApiKey ? `${this.pinataApiKey.substring(0, 10)}...` : 'NOT SET');
        console.log('- Secret Key:', this.pinataSecretKey ? `${this.pinataSecretKey.substring(0, 10)}...` : 'NOT SET');
        console.log('- JWT:', this.pinataJWT ? `${this.pinataJWT.substring(0, 30)}...` : 'NOT SET');

        if (!this.pinataJWT) {
            console.warn('Warning: PINATA_JWT not configured');
        }
    }

    /**
     * Upload file to IPFS via Pinata
     */
    async uploadToIPFS(filePath: string, fileName: string): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            // Optional: Add metadata
            const metadata = JSON.stringify({
                name: fileName,
            });
            formData.append('pinataMetadata', metadata);

            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                        'Authorization': `Bearer ${this.pinataJWT}`,
                    },
                    maxBodyLength: Infinity,
                }
            );

            console.log('File pinned to IPFS:', response.data.IpfsHash);
            return response.data.IpfsHash;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw new Error('Failed to upload file to IPFS');
        }
    }

    /**
     * Upload JSON metadata to IPFS
     */
    async uploadJSONToIPFS(jsonData: any, name: string): Promise<string> {
        try {
            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                {
                    pinataContent: jsonData,
                    pinataMetadata: {
                        name: name,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.pinataJWT}`,
                    },
                }
            );

            console.log('JSON pinned to IPFS:', response.data.IpfsHash);
            return response.data.IpfsHash;
        } catch (error) {
            console.error('Error uploading JSON to IPFS:', error);
            throw new Error('Failed to upload JSON to IPFS');
        }
    }

    /**
     * Delete temporary file after upload
     */
    async cleanupFile(filePath: string): Promise<void> {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('Temporary file deleted:', filePath);
            }
        } catch (error) {
            console.error('Error deleting temporary file:', error);
        }
    }

    /**
     * Get IPFS gateway URL for a hash
     */
    getGatewayURL(ipfsHash: string): string {
        const gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
        return `${gateway}${ipfsHash}`;
    }
}
