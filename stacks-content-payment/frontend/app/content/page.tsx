'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Content } from '@/types';
import { ContentCard } from '@/components/content/content-card';

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
            console.log('Fetching content from API...');
            const response = await api.getAllContent(page, 12);
            console.log('API Response:', response);
            console.log('Content data:', response.data);
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
            <div className="min-h-screen grid-bg">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
                        <p className="mt-4 font-bold text-gray-600">Loading content...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen grid-bg">
                <div className="container mx-auto px-4 py-12">
                    <div className="bg-red-100 neo-border neo-shadow p-6 text-center max-w-2xl mx-auto">
                        <p className="text-red-800 font-bold">{error}</p>
                        <button
                            onClick={loadContent}
                            className="mt-4 px-6 py-3 bg-red-500 text-white neo-border neo-shadow-sm font-black uppercase transition-all neo-hover"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid-bg">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-5xl md:text-6xl font-black mb-8 uppercase">
                    Browse <span className="gradient-text">Content</span>
                </h1>

                {content.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg font-bold">No content available yet</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {content.map((item) => (
                                <ContentCard key={item.contentId} content={item} />
                            ))}
                        </div>

                        {total > 12 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-6 py-3 bg-white neo-border neo-shadow-sm font-black uppercase hover:bg-gray-100 disabled:opacity-50 transition-all neo-hover"
                                >
                                    Previous
                                </button>
                                <span className="px-6 py-3 bg-white neo-border font-bold">
                                    Page {page} of {Math.ceil(total / 12)}
                                </span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(total / 12)}
                                    className="px-6 py-3 bg-white neo-border neo-shadow-sm font-black uppercase hover:bg-gray-100 disabled:opacity-50 transition-all neo-hover"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Creator CTA */}
                <div className="mt-16 bg-gradient-to-br from-orange-500 via-pink-500 to-cyan-400 neo-border-thick neo-shadow-lg p-8 md:p-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase">
                            Want to Publish?
                        </h2>
                        <p className="text-xl font-bold mb-6 text-white">
                            Join as a creator and start earning with <span className="text-yellow-300">USDCx</span> and <span className="text-cyan-200">STX</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/creators"
                                className="px-8 py-4 bg-white text-black neo-border-thick neo-shadow font-black text-lg uppercase tracking-wide transition-all hover:scale-105 inline-flex items-center gap-2"
                            >
                                Join as Creator →
                            </Link>
                            <p className="text-sm font-bold text-white">
                                Set prices • Get paid • Full control
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
