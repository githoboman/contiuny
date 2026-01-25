import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Lock, Unlock, Key } from 'lucide-react';
import { decryptFile } from '@/lib/encryption';

interface ContentViewerProps {
    ipfsHash: string;
    metadataUri: string;
}

export function ContentViewer({ ipfsHash, metadataUri }: ContentViewerProps) {
    const [contentType, setContentType] = useState<string>('unknown');
    const [loading, setLoading] = useState(true);
    const [contentUrl, setContentUrl] = useState<string>(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

    // Privacy State
    const [isLocked, setIsLocked] = useState(false);
    const [password, setPassword] = useState('');
    const [unlocking, setUnlocking] = useState(false);
    const [unlockError, setUnlockError] = useState<string | null>(null);

    useEffect(() => {
        checkStatus();
        return () => {
            // Cleanup blob URLs if we created any
            if (contentUrl.startsWith('blob:')) {
                URL.revokeObjectURL(contentUrl);
            }
        };
    }, [ipfsHash, metadataUri]);

    const checkStatus = async () => {
        setLoading(true);
        try {
            // 1. Check metadata for encryption flag
            let isEncrypted = false;
            if (metadataUri) {
                try {
                    const res = await fetch(metadataUri);
                    const meta = await res.json();
                    if (meta.encrypted) {
                        isEncrypted = true;
                        setIsLocked(true);
                    }
                } catch (e) {
                    console.warn('Failed to fetch metadata for encryption check:', e);
                }
            }

            // 2. If not known to be encrypted, try to detect type normally
            if (!isEncrypted) {
                await detectContentType(contentUrl);
            }
        } finally {
            setLoading(false);
        }
    };

    const detectContentType = async (url: string) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const type = response.headers.get('content-type') || '';

            if (type.startsWith('image/')) {
                setContentType('image');
            } else if (type.includes('pdf')) {
                setContentType('pdf');
            } else if (type.startsWith('video/')) {
                setContentType('video');
            } else if (type.startsWith('audio/')) {
                setContentType('audio');
            } else if (type.includes('text/html')) {
                setContentType('html');
            } else if (type.includes('text/') || type.includes('json')) {
                setContentType('text');
            } else {
                setContentType('download');
            }
        } catch (error) {
            console.error('Failed to detect content type:', error);
            setContentType('download');
        }
    };

    const handleUnlock = async () => {
        if (!password) {
            setUnlockError('Please enter the secret key');
            return;
        }

        setUnlocking(true);
        setUnlockError(null);

        try {
            // 1. Fetch the encrypted blob
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
            if (!response.ok) throw new Error('Failed to fetch encrypted content');
            const encryptedBlob = await response.blob();

            // 2. Decrypt
            const decryptedBuffer = await decryptFile(encryptedBlob, password);

            // 3. Create a Blob from the decrypted data
            // We deduce type from original name if possible, or just guess. 
            // For now, let's try to detect it or default to octet-stream.
            // But actually, we just need a blob to display.
            const decryptedBlob = new Blob([decryptedBuffer]);

            // 4. Create Object URL
            const decryptedUrl = URL.createObjectURL(decryptedBlob);

            setContentUrl(decryptedUrl);
            setIsLocked(false);

            // 5. Detect type of decrypted content
            // We can pass the blob directly if we refactor detect, but URL works fine
            // We might need to guess the type better.
            await detectContentType(decryptedUrl);

        } catch (err) {
            console.error('Unlock failed:', err);
            setUnlockError('Incorrect key or corrupted file.');
        } finally {
            setUnlocking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="bg-black text-white rounded-lg p-8 neo-border flex flex-col items-center justify-center min-h-[300px] text-center space-y-6">
                <Lock className="w-16 h-16 text-yellow-300 mx-auto" />
                <div>
                    <h3 className="text-2xl font-black uppercase mb-2">Restricted Access</h3>
                    <p className="text-gray-400">This content is locked by the creator.</p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Secret Key..."
                            className="w-full bg-gray-900 border-2 border-gray-700 rounded p-4 text-white focus:border-yellow-300 focus:outline-none font-mono text-center text-lg"
                        />
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    </div>

                    {unlockError && (
                        <p className="text-red-500 font-bold bg-red-900/30 p-2 rounded">{unlockError}</p>
                    )}

                    <button
                        onClick={handleUnlock}
                        disabled={unlocking}
                        className="w-full py-3 bg-yellow-300 text-black font-black uppercase neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                    >
                        {unlocking ? 'Unlocking...' : 'Unlock Content'}
                    </button>

                    <p className="text-xs text-gray-500">
                        * Verify the key with the content creator before purchasing.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Content Display */}
            <div className="bg-gray-50 rounded-lg overflow-hidden min-h-[300px] flex flex-col items-center justify-center border">
                {contentType === 'image' && (
                    <div className="relative w-full">
                        <img
                            src={contentUrl}
                            alt="Content"
                            className="w-full h-auto max-h-[600px] object-contain mx-auto"
                            onError={() => setContentType('download')}
                        />
                    </div>
                )}

                {contentType === 'pdf' && (
                    <div className="h-[600px] w-full">
                        <iframe
                            src={contentUrl}
                            className="w-full h-full border-0"
                            title="PDF Viewer"
                        />
                    </div>
                )}

                {contentType === 'video' && (
                    <video
                        controls
                        className="w-full max-h-[600px]"
                        src={contentUrl}
                    >
                        Your browser does not support video playback.
                    </video>
                )}

                {contentType === 'audio' && (
                    <div className="p-8 w-full">
                        <audio
                            controls
                            className="w-full"
                            src={contentUrl}
                        >
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                )}

                {contentType === 'text' && (
                    <div className="p-6 w-full max-h-[600px] overflow-auto">
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border">
                            <TextContent url={contentUrl} />
                        </pre>
                    </div>
                )}

                {(contentType === 'html' || contentType === 'download') && (
                    <div className="p-8 text-center">
                        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4 font-medium">
                            {contentType === 'html' ? 'Web Content / Directory' : 'Binary File'}
                        </p>
                        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                            This content cannot be previewed directly here. You can view it in the gateway or download it.
                        </p>
                        <a
                            href={contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View in IPFS Gateway
                        </a>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <a
                    href={contentUrl}
                    download
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-black uppercase neo-border neo-shadow hover:bg-orange-600 transition"
                >
                    <Download className="w-5 h-5" />
                    Download
                </a>
                <a
                    href={contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white neo-border neo-shadow font-black uppercase hover:bg-gray-50 transition"
                >
                    <ExternalLink className="w-5 h-5" />
                    Open in New Tab
                </a>
            </div>

            {/* IPFS Info */}
            <div className="text-xs text-gray-500 font-mono bg-gray-100 p-3 rounded neo-border">
                <p className="mb-1"><strong>IPFS Hash:</strong> {ipfsHash}</p>
                <p><strong>Gateway:</strong> {`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}</p>
            </div>
        </div>
    );
}

// Helper component to fetch and display text content
function TextContent({ url }: { url: string }) {
    const [text, setText] = useState('Loading...');

    useEffect(() => {
        fetch(url)
            .then(res => res.text())
            .then(setText)
            .catch(() => setText('Failed to load content'));
    }, [url]);

    return <>{text}</>;
}
