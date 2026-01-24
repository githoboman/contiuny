'use client';

import { useState, useEffect } from 'react';
import { Trash2, Eye, DollarSign } from 'lucide-react';
import { formatStx, formatUsd } from '@/lib/utils';

interface CreatorContent {
    contentId: number;
    creator: string;
    ipfsHash: string;
    priceStx: number;
    metadataUri: string;
    priceToken?: number;
    tokenContract?: string;
    isActive: boolean;
    createdAt: Date;
}

interface MyContentListProps {
    address: string;
}

export function MyContentList({ address }: MyContentListProps) {
    const [content, setContent] = useState<CreatorContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        loadContent();
    }, [address]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/creator/${address}`);
            const data = await response.json();

            if (data.success) {
                setContent(data.data);
            }
        } catch (error) {
            console.error('Failed to load content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contentId: number) => {
        if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(contentId);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${contentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creator: address })
            });

            const data = await response.json();

            if (data.success) {
                // Remove from list
                setContent(prev => prev.filter(c => c.contentId !== contentId));
                alert('Content deleted successfully!');
            } else {
                alert(`Failed to delete: ${data.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete content');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (content.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-50 neo-border">
                <p className="text-gray-600 font-bold mb-2">No content yet</p>
                <p className="text-sm text-gray-500">Upload your first content using the Register tab above</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {content.map((item) => (
                <div key={item.contentId} className="bg-white neo-border neo-shadow p-4">
                    <div className="flex items-start justify-between gap-4">
                        {/* Content Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-black">Content #{item.contentId}</h3>
                                {item.isActive ? (
                                    <span className="px-2 py-0.5 bg-green-400 text-black text-xs font-bold uppercase neo-border">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-gray-300 text-black text-xs font-bold uppercase neo-border">
                                        Inactive
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="font-bold">
                                        {formatStx(item.priceStx)}
                                        {item.priceToken && ` or ${formatUsd(item.priceToken)}`}
                                    </span>
                                </div>
                                <p className="text-gray-600 font-mono text-xs">
                                    IPFS: {item.ipfsHash.slice(0, 20)}...
                                </p>
                                <p className="text-gray-500 text-xs">
                                    Created: {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <a
                                href={`/content/${item.contentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-cyan-400 neo-border neo-shadow font-black uppercase text-sm hover:bg-cyan-500 transition flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                View
                            </a>
                            <button
                                onClick={() => handleDelete(item.contentId)}
                                disabled={deleting === item.contentId}
                                className="px-3 py-2 bg-red-500 text-white neo-border neo-shadow font-black uppercase text-sm hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting === item.contentId ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
