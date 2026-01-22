'use client';

import { Content } from '@/types';
import { formatStx, formatUsd } from '@/lib/utils';
import Link from 'next/link';
import { FileText, User, DollarSign } from 'lucide-react';

interface ContentCardProps {
    content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
    const { contentId, metadata } = content;

    // Extract title from metadata URI or use default
    const title = `Premium Content #${contentId}`;
    const description = "Exclusive digital content available for purchase";

    return (
        <Link href={`/content/${contentId}`}>
            <div className="neo-border neo-shadow bg-white hover:translate-x-1 hover:translate-y-1 hover:neo-shadow-sm transition-all cursor-pointer overflow-hidden">
                {/* Header with icon */}
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-4 flex items-center gap-3">
                    <div className="bg-white p-2 neo-border">
                        <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-white uppercase">{title}</h3>
                        {metadata.isActive && (
                            <span className="inline-block px-2 py-0.5 bg-green-400 text-black text-xs font-bold uppercase neo-border mt-1">
                                Available
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-700 font-medium">{description}</p>

                    <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 neo-border">
                            {metadata.creator.slice(0, 8)}...{metadata.creator.slice(-4)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t-4 border-black">
                        <DollarSign className="w-5 h-5" />
                        <div className="flex-1">
                            <div className="font-black text-lg">{formatStx(metadata.priceStx)}</div>
                            {metadata.priceToken && (
                                <div className="text-sm text-gray-600 font-bold">or {formatUsd(metadata.priceToken)}</div>
                            )}
                        </div>
                    </div>

                    <button className="w-full py-3 bg-black text-white font-black uppercase neo-border neo-shadow hover:bg-gray-800 transition">
                        View & Purchase
                    </button>
                </div>
            </div>
        </Link>
    );
}
