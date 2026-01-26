'use client';

import { Content } from '@/types';
import { formatStx, formatUsd } from '@/lib/utils';
import Link from 'next/link';
import { User, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NeoCard } from '@/components/ui/neo-card';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoBadge } from '@/components/ui/neo-badge';

interface ContentCardProps {
    content: Content;
}

interface Metadata {
    title?: string;
    description?: string;
    author?: string;
    preview?: string;
}

export function ContentCard({ content }: ContentCardProps) {
    const { contentId, metadata } = content;
    const [metadataInfo, setMetadataInfo] = useState<Metadata>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch metadata from IPFS
        const fetchMetadata = async () => {
            try {
                if (!metadata.metadataUri) return;
                const response = await fetch(metadata.metadataUri);

                if (!response.ok) {
                    setLoading(false);
                    return;
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                setMetadataInfo(data);
            } catch (error) {
                console.warn('Failed to fetch metadata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [metadata.metadataUri]);

    const title = metadataInfo.title || `Premium Content #${contentId}`;
    const description = metadataInfo.description || "Exclusive digital content available for purchase";
    const author = metadataInfo.author || metadata.creator.slice(0, 8) + '...';
    const preview = metadataInfo.preview || `https://gateway.pinata.cloud/ipfs/${metadata.ipfsHash}`;

    return (
        <NeoCard className="p-0 overflow-hidden flex flex-col h-full group">
            {/* Preview Banner */}
            <Link href={`/content/${contentId}`} className="block relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden border-b-4 border-black">
                <img
                    src={preview}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {metadata.isActive ? (
                        <NeoBadge variant="success" animatePulse className="shadow-[4px_4px_0px_0px_#000000]">Active</NeoBadge>
                    ) : (
                        <NeoBadge variant="warning" className="shadow-[4px_4px_0px_0px_#000000]">Inactive</NeoBadge>
                    )}
                </div>

                <div className="absolute top-3 left-3">
                    <NeoBadge variant="secondary" className="shadow-[4px_4px_0px_0px_#FFFFFF] border-white">
                        #{contentId}
                    </NeoBadge>
                </div>
            </Link>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col space-y-4 bg-white relative">
                {/* Title */}
                <Link href={`/content/${contentId}`} className="block flex-1">
                    <h3 className="text-xl font-black uppercase leading-tight hover:text-[#FF6B00] transition-colors line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 font-bold mt-2 line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                </Link>

                {/* Meta */}
                <div className="flex items-center justify-between border-t-4 border-black pt-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1.5 rounded-full border-2 border-black">
                            <User className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-black uppercase text-gray-500">
                            {author}
                        </span>
                    </div>
                </div>

                {/* Pricing & Actions */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#FF6B00]" />
                        <div className="font-black text-2xl">
                            {formatStx(metadata.priceStx)}
                        </div>
                        {metadata.priceToken && (
                            <span className="text-xs font-bold text-gray-400 self-end mb-1">
                                / {formatUsd(metadata.priceToken)}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Link href={`/creators/${metadata.creator}`} className="w-full">
                            <NeoButton variant="secondary" neoSize="sm" className="w-full text-xs">
                                Profile
                            </NeoButton>
                        </Link>
                        <Link href={`/content/${contentId}`} className="w-full">
                            <NeoButton variant="primary" neoSize="sm" className="w-full text-xs border-black">
                                Purchase
                            </NeoButton>
                        </Link>
                    </div>
                </div>
            </div>
        </NeoCard>
    );
}
