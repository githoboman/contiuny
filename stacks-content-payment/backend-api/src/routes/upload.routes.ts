import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { UploadService } from '../services/uploadService';
import { ApiResponse } from '../types';

const router = Router();
const uploadService = new UploadService();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept all file types for now
        cb(null, true);
    }
});

/**
 * POST /api/upload
 * Upload file to IPFS via Pinata
 */
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            } as ApiResponse<null>);
        }

        console.log('File received:', req.file.originalname);

        // Upload to IPFS
        const ipfsHash = await uploadService.uploadToIPFS(
            req.file.path,
            req.file.originalname
        );

        // Clean up temporary file
        await uploadService.cleanupFile(req.file.path);

        // Get gateway URL
        const gatewayUrl = uploadService.getGatewayURL(ipfsHash);

        res.status(200).json({
            success: true,
            data: {
                ipfsHash,
                gatewayUrl,
                fileName: req.file.originalname,
                fileSize: req.file.size
            },
            message: 'File uploaded to IPFS successfully'
        } as ApiResponse<{
            ipfsHash: string;
            gatewayUrl: string;
            fileName: string;
            fileSize: number;
        }>);
    } catch (error) {
        // Clean up file if upload failed
        if (req.file) {
            await uploadService.cleanupFile(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload file'
        } as ApiResponse<null>);
    }
});

/**
 * POST /api/upload/metadata
 * Upload JSON metadata to IPFS
 */
router.post('/metadata', async (req: Request, res: Response) => {
    try {
        const { metadata, name } = req.body;

        if (!metadata) {
            return res.status(400).json({
                success: false,
                error: 'No metadata provided'
            } as ApiResponse<null>);
        }

        const ipfsHash = await uploadService.uploadJSONToIPFS(
            metadata,
            name || 'metadata'
        );

        const gatewayUrl = uploadService.getGatewayURL(ipfsHash);

        res.status(200).json({
            success: true,
            data: {
                ipfsHash,
                gatewayUrl
            },
            message: 'Metadata uploaded to IPFS successfully'
        } as ApiResponse<{
            ipfsHash: string;
            gatewayUrl: string;
        }>);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload metadata'
        } as ApiResponse<null>);
    }
});

export default router;
