'use client';

import { useState } from 'react';

interface MetadataFormProps {
    onMetadataGenerated: (metadataUri: string) => void;
}

export function MetadataForm({ onMetadataGenerated }: MetadataFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        author: '',
        category: 'Education',
        contentType: 'article',
        tags: '',
        thumbnail: ''
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate() {
        if (!formData.title || !formData.description) {
            setError('Title and description are required');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3005/api/upload/metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate metadata');
            }

            const data = await response.json();

            if (data.success) {
                onMetadataGenerated(data.data.gatewayUrl);
            } else {
                throw new Error(data.error || 'Failed to generate metadata');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate metadata');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Content Metadata</h3>
            <p className="text-sm text-gray-600 mb-4">
                Fill in the details below and we'll automatically create and upload your metadata to IPFS
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Introduction to Blockchain"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                    </label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="A comprehensive guide to understanding blockchain technology..."
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Author
                        </label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            placeholder="Your Name"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Education">Education</option>
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            <option value="Art">Art</option>
                            <option value="Music">Music</option>
                            <option value="Video">Video</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content Type
                        </label>
                        <select
                            value={formData.contentType}
                            onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                            <option value="image">Image</option>
                            <option value="document">Document</option>
                            <option value="course">Course</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="blockchain, crypto, education"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thumbnail URL (optional)
                    </label>
                    <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="https://example.com/thumbnail.jpg"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={uploading}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                >
                    {uploading ? 'Generating Metadata...' : 'Generate & Upload Metadata'}
                </button>
            </div>
        </div>
    );
}
