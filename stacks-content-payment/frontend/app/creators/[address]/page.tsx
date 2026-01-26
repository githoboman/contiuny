'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Content } from '@/types';
import { ContentCard } from '@/components/content/content-card';
import { shortenAddress } from '@/lib/utils';
import { use } from 'react';

export default function CreatorProfilePage({ params }: { params: Promise<{ address: string }> }) {
    // Unguard params for Next.js 15+
    const resolvedParams = use(params);
    const { address } = resolvedParams;

    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCreatorContent();
    }, [address]);

    const loadCreatorContent = async () => {
        try {
            setLoading(true);
            const response = await api.getCreatorContent(address);
            if (response.success) {
                setContent(response.data || []);
            }
        } catch (err) {
            console.error('Error loading creator content:', err);
            setError('Failed to load creator profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen grid-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen grid-bg p-8">
                <div className="bg-red-50 neo-border p-6 text-center max-w-md mx-auto">
                    <p className="text-red-800 font-bold">{error}</p>
                    <button onClick={loadCreatorContent} className="mt-4 text-sm font-bold underline">Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid-bg">
            {/* Profile Header */}
            <div className="bg-white border-b-4 border-black py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mx-auto mb-6 neo-border neo-shadow flex items-center justify-center text-3xl font-black text-white uppercase">
                            {address.slice(0, 2)}
                        </div>
                        <h1 className="text-4xl font-black uppercase mb-2">Creator Profile</h1>
                        <p className="font-mono text-gray-600 bg-gray-100 px-4 py-2 inline-block rounded neo-border">
                            {address}
                        </p>

                        <div className="mt-8 flex justify-center gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-black">{content.length}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black">--</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Sales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-black uppercase mb-8 border-l-8 border-orange-500 pl-4">
                    Released Content
                </h2>

                {content.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg font-bold">This creator hasn't published anything yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {content.map((item) => (
                            <ContentCard key={item.contentId} content={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
