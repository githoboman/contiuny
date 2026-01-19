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
            const response = await api.getAllContent(page, 12);
            setContent(response.data);
            setTotal(response.total);
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
                    <p className="mt-4 text-gray-600">Loading content...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800">{error}</p>
                    <button
                        onClick={loadContent}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">Browse Content</h1>

            {content.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No content available yet</p>
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
                                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {Math.ceil(total / 12)}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(total / 12)}
                                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Creator CTA */}
            <div className="mt-16 bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-orange-200">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                        Want to Publish Your Own Content?
                    </h2>
                    <p className="text-lg text-gray-700 mb-6">
                        Join as a creator and start earning with <span className="font-bold text-orange-600">USDCx</span> and <span className="font-bold text-blue-600">STX</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/creators"
                            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Join as Creator →
                        </Link>
                        <p className="text-sm text-gray-600">
                            Set your own prices • Get paid directly • Full control
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
