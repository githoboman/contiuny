'use client';

import { useState, useEffect } from 'react';
import { Trash2, Eye, DollarSign, ExternalLink } from 'lucide-react';
import { formatStx, formatUsd, shortenAddress } from '@/lib/utils';

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

// Inner component to handle individual item state (metadata fetching)
function ContentListItem({ item, onDelete, isDeleting }: {
    item: CreatorContent;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}) {
    const [title, setTitle] = useState<string>(`Content #${item.contentId}`);
    const [loadingMetadata, setLoadingMetadata] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                if (!item.metadataUri) return;

                const response = await fetch(item.metadataUri);
                if (response.ok) {
                    const data = await response.json();
                    if (data.title) {
                        setTitle(data.title);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch metadata for item', item.contentId);
            } finally {
                setLoadingMetadata(false);
            }
        };

        fetchMetadata();
    }, [item.metadataUri, item.contentId]);

    return (
        <div className="bg-white neo-border neo-shadow p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Content Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className={`text-lg font-black ${loadingMetadata ? 'animate-pulse bg-gray-200 text-transparent rounded' : ''}`}>
                            {title}
                        </h3>
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

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold">
                                {formatStx(item.priceStx)}
                                {item.priceToken && (
                                    <span className="text-gray-500 ml-1">
                                        or {formatUsd(item.priceToken)}
                                    </span>
                                )}
                            </span>
                        </div>

                        <p className="text-gray-500 text-xs flex items-center gap-1">
                            <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>ID: {item.contentId}</span>
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 sm:self-center">
                    <a
                        href={`/content/${item.contentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-cyan-400 text-black neo-border neo-shadow font-black uppercase text-sm hover:bg-cyan-500 transition flex items-center gap-2"
                        title="View Public Page"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View
                    </a>
                    <button
                        onClick={() => onDelete(item.contentId)}
                        disabled={isDeleting}
                        className="px-3 py-2 bg-red-500 text-white neo-border neo-shadow font-black uppercase text-sm hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? '...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
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
            <div className="text-center p-12 bg-gray-50 neo-border border-dashed">
                <p className="text-gray-600 font-bold mb-2 text-lg">No content yet</p>
                <p className="text-sm text-gray-500">Upload your first digital product using the Register tab above.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {content.map((item) => (
                <ContentListItem
                    key={item.contentId}
                    item={item}
                    onDelete={handleDelete}
                    isDeleting={deleting === item.contentId}
                />
            ))}
        </div>
    );
}
