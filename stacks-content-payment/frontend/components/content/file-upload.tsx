import { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { encryptFile } from '@/lib/encryption';

interface FileUploadProps {
    onUploadComplete: (ipfsHash: string, gatewayUrl: string, isEncrypted: boolean) => void;
    accept?: string;
    maxSize?: number; // in MB
}

export function FileUpload({ onUploadComplete, accept, maxSize = 100 }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Privacy / Encryption State
    const [isLocked, setIsLocked] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    async function handleUpload(file: File) {
        if (!file) return;

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            setError(`File size exceeds ${maxSize}MB limit`);
            return;
        }

        if (isLocked && !password) {
            setError('Please enter a Secret Key to lock this content');
            return;
        }

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            let fileToUpload: File | Blob = file;

            // Encrypt if locked
            if (isLocked && password) {
                console.log('Locking content...');
                const encryptedBlob = await encryptFile(file, password);
                // Create a new File object from the blob to keep the name but add .locked extension
                fileToUpload = new File([encryptedBlob], `${file.name}.locked`, { type: 'application/octet-stream' });
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

            const response = await fetch(`${apiUrl}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setProgress(100);
                onUploadComplete(data.data.ipfsHash, data.data.gatewayUrl, isLocked);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    }

    function handleDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    }

    return (
        <div className="w-full space-y-4">
            {/* Privacy Toggle */}
            <div className={`p-4 rounded-lg border-2 transition-colors ${isLocked ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-black'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {isLocked ? <Lock className="w-6 h-6 text-yellow-300" /> : <Unlock className="w-6 h-6 text-gray-400" />}
                        <span className="font-black uppercase tracking-wide">
                            {isLocked ? 'Content Locked' : 'Public Content'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsLocked(!isLocked)}
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full border-2 transition-all ${isLocked
                                ? 'border-white text-white hover:bg-white hover:text-black'
                                : 'border-black text-black hover:bg-black hover:text-white'
                            }`}
                    >
                        {isLocked ? 'Disable Lock' : 'Enable Lock'}
                    </button>
                </div>

                {/* Password Input */}
                {isLocked && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Set Secret Key</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a secure key to lock this file..."
                                className="w-full bg-gray-900 border-2 border-gray-700 rounded p-3 text-white focus:border-yellow-300 focus:outline-none font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400">
                            * You must accept/share this key with buyers manually. It is not stored on the blockchain.
                        </p>
                    </div>
                )}
            </div>

            {/* Dropzone */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleChange}
                    accept={accept}
                    disabled={uploading}
                />

                <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                >
                    {uploading ? (
                        <div className="space-y-4">
                            <div className="text-orange-600 font-bold uppercase animate-pulse">
                                {isLocked ? 'Encrypting & Uploading...' : 'Uploading to IPFS...'}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                                <div
                                    className="bg-orange-500 h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-gray-600">
                                <span className="font-black text-orange-600 hover:text-orange-700 underline decoration-2 underline-offset-2">
                                    CHOOSE FILE
                                </span>
                                {' '}or drag and drop
                            </div>
                            <p className="text-xs font-bold uppercase text-gray-400">
                                Max size: {maxSize}MB
                            </p>
                        </div>
                    )}
                </label>
            </div>

            {error && (
                <div className="mt-2 text-sm font-bold text-red-600 bg-red-50 p-3 rounded border border-red-200">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
