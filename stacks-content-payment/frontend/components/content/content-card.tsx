'use client';

import { Content } from '@/types';
import { formatStx, formatUsd } from '@/lib/utils';
import Link from 'next/link';

interface ContentCardProps {
    content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
    const { contentId, metadata } = content;

    return (
        <Link href={`/content/${contentId}`}>
            <div className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer bg-white">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{metadata.metadataUri}</h3>
                    {metadata.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                    ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
                    )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <div>
                        <span className="font-medium">Creator:</span> {metadata.creator.slice(0, 10)}...
                    </div>
                    <div>
                        <span className="font-medium">Price:</span> {formatStx(metadata.priceStx)}
                        {metadata.priceToken && ` or ${formatUsd(metadata.priceToken)}`}
                    </div>
                    <div>
                        <span className="font-medium">IPFS:</span> {metadata.ipfsHash.slice(0, 20)}...
                    </div>
                </div>

                <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    View Details
                </button>
            </div>
        </Link>
    );
}
