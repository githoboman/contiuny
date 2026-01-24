'use client';

import { Content } from '@/types';
import { formatStx, formatUsd } from '@/lib/utils';
import Link from 'next/link';
import { FileText, User, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

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
        fetchMetadata();
    }, [metadata.metadataUri]);

    const fetchMetadata = async () => {
        try {
            const response = await fetch(metadata.metadataUri);

            if (!response.ok) {
                console.warn('Failed to fetch metadata:', response.status);
                setLoading(false);
                return;
            }

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('Metadata URI returned non-JSON response');
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

    const title = metadataInfo.title || `Premium Content #${contentId}`;
    const description = metadataInfo.description || "Exclusive digital content available for purchase";
    const author = metadataInfo.author || metadata.creator.slice(0, 8) + '...';
    const preview = metadataInfo.preview || `https://gateway.pinata.cloud/ipfs/${metadata.ipfsHash}`;

    return (
        <Link href={`/content/${contentId}`}>
            <div className="neo-border neo-shadow bg-white hover:translate-x-1 hover:translate-y-1 hover:neo-shadow-sm transition-all cursor-pointer overflow-hidden">
                {/* Preview Banner */}
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <img
                        src={preview}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to gradient if image fails to load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Status badge */}
                    {metadata.isActive && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-block px-3 py-1 bg-green-400 text-black text-xs font-bold uppercase neo-border">
                                Available
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="text-xl font-black uppercase line-clamp-2">{title}</h3>

                    {/* Description */}
                    <p className="text-sm text-gray-700 font-medium line-clamp-2">{description}</p>

                    {/* Author */}
                    <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        <span className="font-bold text-gray-600">By {author}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 pt-2 border-t-4 border-black">
                        <DollarSign className="w-5 h-5" />
                        <div className="flex-1">
                            <div className="font-black text-lg">{formatStx(metadata.priceStx)}</div>
                            {metadata.priceToken && (
                                <div className="text-sm text-gray-600 font-bold">or {formatUsd(metadata.priceToken)}</div>
                            )}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full py-3 bg-black text-white font-black uppercase neo-border neo-shadow hover:bg-gray-800 transition">
                        View & Purchase
                    </button>
                </div>
            </div>
        </Link>
    );
}
