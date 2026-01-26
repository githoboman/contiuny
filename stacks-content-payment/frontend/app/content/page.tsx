'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Content } from '@/types';
import { ContentCard } from '@/components/content/content-card';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ContentPage() {
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadContent();
    }, [page]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const response = await api.getAllContent(page, 12);
            setContent(response.data);
            setTotal(response.total);
        } catch (err) {
            console.error('Error loading content:', err);
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen grid-bg flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen grid-bg flex items-center justify-center">
                <NeoCard variant="dark" className="max-w-md text-center">
                    <p className="text-[#FF6B00] font-black uppercase mb-4">Error Loading Content</p>
                    <p className="text-white mb-6">{error}</p>
                    <NeoButton onClick={loadContent} variant="primary">
                        Try Again
                    </NeoButton>
                </NeoCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid-bg pb-20">
            {/* Header */}
            <div className="bg-black border-b-4 border-[#FF6B00] py-12 mb-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-black uppercase text-white tracking-tight mb-2">
                        Browse <span className="text-[#FF6B00]">Content</span>
                    </h1>
                    <p className="font-bold text-gray-400 uppercase tracking-widest">
                        Digital Assets Marketplace
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {content.length === 0 ? (
                    <div className="text-center py-20">
                        <NeoCard className="inline-block p-12">
                            <p className="text-gray-500 text-xl font-bold uppercase">No content available yet</p>
                            <Link href="/creators" className="block mt-6">
                                <NeoButton>
                                    Become a Creator
                                </NeoButton>
                            </Link>
                        </NeoCard>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {content.map((item) => (
                                <ContentCard key={item.contentId} content={item} />
                            ))}
                        </div>

                        {total > 12 && (
                            <div className="mt-16 flex justify-center items-center gap-4">
                                <NeoButton
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    variant="secondary"
                                    className="px-4"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </NeoButton>
                                <span className="font-black text-xl bg-white border-4 border-black px-4 py-2">
                                    {page} / {Math.ceil(total / 12)}
                                </span>
                                <NeoButton
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(total / 12)}
                                    variant="secondary"
                                    className="px-4"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </NeoButton>
                            </div>
                        )}
                    </>
                )}

                {/* Creator CTA */}
                <div className="mt-20">
                    <NeoCard variant="highlight" className="p-12 md:p-16 text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase text-black max-w-4xl mx-auto leading-tight">
                            Publish Your Own Content
                        </h2>
                        <p className="text-xl md:text-2xl font-bold mb-10 max-w-2xl mx-auto opacity-90">
                            Join existing creators and start earning STX and USDCx today.
                        </p>
                        <Link href="/creators">
                            <NeoButton
                                variant="dark"
                                neoSize="lg"
                                className="text-xl px-12 py-6 border-[#FF6B00]"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Creating Now
                            </NeoButton>
                        </Link>
                    </NeoCard>
                </div>
            </div>
        </div>
    );
}
