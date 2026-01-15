'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Content } from '@/types';
import { PaymentButton } from '@/components/content/payment-button';
import { useWallet } from '@/components/wallet/wallet-provider';
import { formatStx, formatUsd } from '@/lib/utils';

export default function ContentDetailPage() {
    const params = useParams();
    const contentId = parseInt(params.id as string);
    const { address } = useWallet();

    const [content, setContent] = useState<Content | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadContent();
    }, [contentId, address]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const response = await api.getContent(contentId);
            setContent(response.data || null);

            // Check if user has access
            if (address) {
                const accessResponse = await api.verifyPayment(contentId, address);
                setHasAccess(accessResponse.data?.hasPaid || false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-800">{error || 'Content not found'}</p>
                </div>
            </div>
        );
    }

    const { metadata } = content;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-6">Content #{contentId}</h1>

                    <div className="space-y-4 mb-8">
                        <div>
                            <span className="font-medium text-gray-700">Creator:</span>
                            <p className="text-gray-900 font-mono text-sm">{metadata.creator}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-700">IPFS Hash:</span>
                            <p className="text-gray-900 font-mono text-sm">{metadata.ipfsHash}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-700">Metadata URI:</span>
                            <a
                                href={metadata.metadataUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {metadata.metadataUri}
                            </a>
                        </div>

                        <div>
                            <span className="font-medium text-gray-700">Price:</span>
                            <p className="text-gray-900">
                                {formatStx(metadata.priceStx)}
                                {metadata.priceToken && ` or ${formatUsd(metadata.priceToken)}`}
                            </p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-sm ${metadata.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {metadata.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {hasAccess ? (
                        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                            <h2 className="text-xl font-bold text-green-800 mb-4">✓ You have access to this content</h2>
                            <p className="text-green-700 mb-4">You can now view the full content.</p>
                            <div className="bg-white p-4 rounded border">
                                <p className="text-gray-600">Content would be displayed here...</p>
                                <p className="text-sm text-gray-500 mt-2">IPFS: {metadata.ipfsHash}</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Purchase Access</h2>
                            <PaymentButton
                                contentId={contentId}
                                priceStx={metadata.priceStx}
                                priceToken={metadata.priceToken}
                                tokenContract={metadata.tokenContract}
                                onSuccess={loadContent}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
