'use client';

import { useState } from 'react';
import { useWallet } from '@/components/wallet/wallet-provider';
import { api } from '@/lib/api';

export default function CreatorDashboard() {
    const { address, isConnected } = useWallet();
    const [formData, setFormData] = useState({
        ipfsHash: '',
        priceStx: '',
        metadataUri: '',
        priceToken: '',
        tokenContract: process.env.NEXT_PUBLIC_MOCK_USDC || '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !address) {
            setError('Please connect your wallet first');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const priceStxMicroStx = parseFloat(formData.priceStx) * 1_000_000;
            const priceTokenCents = formData.priceToken ? parseFloat(formData.priceToken) * 100 : undefined;

            const data = {
                creator: address,
                ipfsHash: formData.ipfsHash,
                priceStx: priceStxMicroStx,
                metadataUri: formData.metadataUri,
                ...(priceTokenCents && {
                    priceToken: priceTokenCents,
                    tokenContract: formData.tokenContract,
                }),
            };

            const response = await api.registerContent(data);

            if (response.success && response.data) {
                setSuccess(`Content registered successfully! ID: ${response.data.contentId}`);
                setFormData({
                    ipfsHash: '',
                    priceStx: '',
                    metadataUri: '',
                    priceToken: '',
                    tokenContract: process.env.NEXT_PUBLIC_MOCK_USDC || '',
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to register content');
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-yellow-800 mb-4">Wallet Not Connected</h2>
                        <p className="text-yellow-700">Please connect your wallet to access the creator dashboard.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Creator Dashboard</h1>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6">Register New Content</h2>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-medium">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IPFS Hash *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.ipfsHash}
                                onChange={(e) => setFormData({ ...formData, ipfsHash: e.target.value })}
                                placeholder="QmTest123..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                The IPFS hash of your content
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price in STX *
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.priceStx}
                                onChange={(e) => setFormData({ ...formData, priceStx: e.target.value })}
                                placeholder="1.00"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Price in STX (e.g., 1.00 for 1 STX)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Metadata URI *
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.metadataUri}
                                onChange={(e) => setFormData({ ...formData, metadataUri: e.target.value })}
                                placeholder="https://example.com/metadata.json"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                URL to your content metadata
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Optional: Token Pricing</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price in USD (xUSDC)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.priceToken}
                                    onChange={(e) => setFormData({ ...formData, priceToken: e.target.value })}
                                    placeholder="5.00"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Price in USD (e.g., 5.00 for $5.00)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Token Contract
                                </label>
                                <input
                                    type="text"
                                    value={formData.tokenContract}
                                    onChange={(e) => setFormData({ ...formData, tokenContract: e.target.value })}
                                    placeholder="STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.mock-usdc"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    SIP-010 token contract address
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-lg"
                        >
                            {loading ? 'Registering...' : 'Register Content'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">💡 Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Upload your content to IPFS first and get the hash</li>
                        <li>• Set a fair price in STX for your content</li>
                        <li>• Optionally add USD pricing for token payments</li>
                        <li>• Make sure your metadata URI is accessible</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
