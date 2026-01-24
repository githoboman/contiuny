'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface ContentViewerProps {
    ipfsHash: string;
    metadataUri: string;
}

export function ContentViewer({ ipfsHash, metadataUri }: ContentViewerProps) {
    const [contentType, setContentType] = useState<string>('unknown');
    const [loading, setLoading] = useState(true);

    // Construct IPFS gateway URL
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    useEffect(() => {
        // Detect content type from file extension or fetch headers
        detectContentType();
    }, [ipfsHash]);

    const detectContentType = async () => {
        try {
            const response = await fetch(ipfsUrl, { method: 'HEAD' });
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
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
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
                            src={ipfsUrl}
                            alt="Content"
                            className="w-full h-auto max-h-[600px] object-contain mx-auto"
                            onError={() => setContentType('download')}
                        />
                    </div>
                )}

                {contentType === 'pdf' && (
                    <div className="h-[600px] w-full">
                        <iframe
                            src={ipfsUrl}
                            className="w-full h-full border-0"
                            title="PDF Viewer"
                        />
                    </div>
                )}

                {contentType === 'video' && (
                    <video
                        controls
                        className="w-full max-h-[600px]"
                        src={ipfsUrl}
                    >
                        Your browser does not support video playback.
                    </video>
                )}

                {contentType === 'audio' && (
                    <div className="p-8 w-full">
                        <audio
                            controls
                            className="w-full"
                            src={ipfsUrl}
                        >
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                )}

                {contentType === 'text' && (
                    <div className="p-6 w-full max-h-[600px] overflow-auto">
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border">
                            <TextContent url={ipfsUrl} />
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
                            href={ipfsUrl}
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
                    href={ipfsUrl}
                    download
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-black uppercase neo-border neo-shadow hover:bg-orange-600 transition"
                >
                    <Download className="w-5 h-5" />
                    Download
                </a>
                <a
                    href={ipfsUrl}
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
                <p><strong>Gateway:</strong> {ipfsUrl}</p>
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
