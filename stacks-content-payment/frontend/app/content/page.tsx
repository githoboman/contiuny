'use client';

import { useEffect, useState } from 'react';
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
        </div>
    );
}
