'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Content } from '@/types';
import { PaymentButton } from '@/components/content/payment-button';
import { ContentViewer } from '@/components/content/content-viewer';
import { useWallet } from '@/components/wallet/wallet-provider';
import { formatStx, formatUsd, shortenAddress } from '@/lib/utils';

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

                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-gray-100 p-2 rounded-full border-2 border-black">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase text-gray-500">Creator</p>
                            <Link href={`/creators/${metadata.creator}`} className="font-bold text-lg hover:text-[#FF6B00] underline">
                                {shortenAddress(metadata.creator)}
                            </Link>
                        </div>
                        <div className="ml-auto">
                            <span className={`px-3 py-1 font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${metadata.isActive ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}`}>
                                {metadata.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
                            <p className="font-black uppercase text-xs text-gray-500 mb-1">Price</p>
                            <p className="text-2xl font-black">
                                {formatStx(metadata.priceStx)}
                                {metadata.priceToken && <span className="text-gray-400 text-lg ml-2">/ {formatUsd(metadata.priceToken)}</span>}
                            </p>
                        </div>

                        <div className="bg-blue-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
                            <p className="font-black uppercase text-xs text-gray-500 mb-1">Secure Content</p>
                            <p className="text-sm font-bold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                Verified & Encrypted
                            </p>
                        </div>
                    </div>

                    {hasAccess ? (
                        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                            <h2 className="text-xl font-bold text-green-800 mb-4">✓ You have access to this content</h2>
                            <p className="text-green-700 mb-4">Your payment was successful! View your content below:</p>

                            {/* Content Viewer */}
                            <div className="bg-white p-4 rounded border">
                                <ContentViewer ipfsHash={metadata.ipfsHash} metadataUri={metadata.metadataUri} />
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
