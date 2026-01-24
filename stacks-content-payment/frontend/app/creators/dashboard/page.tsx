'use client';

import { useState } from 'react';
import { useWallet } from '@/components/wallet/wallet-provider';
import { api } from '@/lib/api';
import { FileUpload } from '@/components/content/file-upload';
import { MetadataForm } from '@/components/content/metadata-form';
import { SimpleBridge } from '@/components/bridge/simple-bridge';
import { MyContentList } from '@/components/content/my-content-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function CreatorDashboard() {
    const { address, isConnected } = useWallet();
    const [formData, setFormData] = useState({
        ipfsHash: '',
        priceStx: '',
        metadataUri: '',
        priceToken: '',
        tokenContract: process.env.NEXT_PUBLIC_USDCX_ADDRESS || process.env.NEXT_PUBLIC_MOCK_USDC || '',
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
            // Convert to 6-decimal units (e.g. USDC uses 6 decimals)
            const priceTokenUnits = formData.priceToken ? parseFloat(formData.priceToken) * 1_000_000 : undefined;

            const data = {
                creator: address,
                ipfsHash: formData.ipfsHash,
                priceStx: priceStxMicroStx,
                metadataUri: formData.metadataUri,
                ...(priceTokenUnits && {
                    priceToken: priceTokenUnits,
                    tokenContract: formData.tokenContract,
                }),
            };

            console.log('Submitting content registration:', data);

            const response = await api.registerContent(data);

            console.log('Registration response:', response);

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
        } catch (err: any) {
            console.error('Registration error:', err);
            // Show detailed error if available
            const errorMessage = err.response?.data?.details
                ? `Validation failed: ${err.response.data.details.join(', ')}`
                : err.message || 'Failed to register content';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-yellow-800 mb-4">Wallet Not Connected</h2>
                        <p className="text-yellow-700 mb-4">Please connect your wallet to access the creator dashboard.</p>
                        <p className="text-sm text-yellow-600">
                            Use the "Connect Wallet" button in the header above
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/creators" className="text-sm text-gray-600 hover:text-orange-600 mb-2 inline-block">
                        ← Back to Creator Portal
                    </Link>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                        Creator Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your content and earnings</p>
                </div>

                <Tabs defaultValue="register" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow">
                            📝 Register
                        </TabsTrigger>
                        <TabsTrigger value="my-content" className="data-[state=active]:bg-white data-[state=active]:shadow">
                            📚 My Content
                        </TabsTrigger>
                        <TabsTrigger value="earnings" className="data-[state=active]:bg-white data-[state=active]:shadow">
                            💰 Earnings
                        </TabsTrigger>
                        <TabsTrigger value="usdcx" className="data-[state=active]:bg-white data-[state=active]:shadow">
                            🌉 Bridge
                        </TabsTrigger>
                    </TabsList>

                    {/* Register Content Tab */}
                    <TabsContent value="register">
                        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
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
                                {/* File Upload Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Content File
                                    </label>
                                    <FileUpload
                                        onUploadComplete={async (hash, gatewayUrl) => {
                                            console.log('Upload complete:', { hash, gatewayUrl });

                                            // Auto-generate metadata JSON with rich information
                                            const metadata = {
                                                title: `Premium Content - ${new Date().toLocaleDateString()}`,
                                                description: "Exclusive digital content available for purchase on the Stacks blockchain. High-quality content from verified creators.",
                                                author: address || 'Anonymous Creator',
                                                contentType: 'digital-asset',
                                                ipfsHash: hash,
                                                preview: gatewayUrl, // Use the uploaded file as preview
                                                createdAt: new Date().toISOString(),
                                                tags: ['premium', 'exclusive', 'digital-content']
                                            };

                                            // Upload metadata to IPFS
                                            const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
                                                type: 'application/json'
                                            });
                                            const metadataFile = new File([metadataBlob], 'metadata.json', {
                                                type: 'application/json'
                                            });

                                            try {
                                                const formData = new FormData();
                                                formData.append('file', metadataFile);

                                                const uploadResponse = await fetch(
                                                    'https://api.pinata.cloud/pinning/pinFileToIPFS',
                                                    {
                                                        method: 'POST',
                                                        headers: {
                                                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
                                                        },
                                                        body: formData
                                                    }
                                                );

                                                if (!uploadResponse.ok) {
                                                    console.warn('Metadata upload to IPFS failed, using embedded metadata');
                                                    throw new Error('Skip to fallback');
                                                }

                                                const metadataResult = await uploadResponse.json();
                                                const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;

                                                console.log('Metadata uploaded:', metadataUri);

                                                setFormData(prev => ({
                                                    ...prev,
                                                    ipfsHash: hash,
                                                    metadataUri: metadataUri
                                                }));
                                            } catch (error) {
                                                console.warn('Using embedded metadata (IPFS upload not configured)');
                                                // Fallback: create a data URI with the metadata JSON
                                                const metadataDataUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    ipfsHash: hash,
                                                    metadataUri: metadataDataUri
                                                }));
                                            }
                                        }}
                                        maxSize={100}
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Upload your content file - metadata will be auto-generated
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">OR enter IPFS hash manually</span>
                                    </div>
                                </div>

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
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Price in STX (e.g., 1.00 for 1 STX)
                                    </p>
                                </div>

                                {/* Metadata Generation */}
                                <MetadataForm
                                    onMetadataGenerated={(metadataUri) => {
                                        setFormData({ ...formData, metadataUri });
                                        setSuccess('Metadata generated and uploaded to IPFS!');
                                    }}
                                />

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">OR enter metadata URI manually</span>
                                    </div>
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
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        URL to your content metadata
                                    </p>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium mb-4">Optional: USDCx Pricing</h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price in USD (USDCx)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.priceToken}
                                            onChange={(e) => setFormData({ ...formData, priceToken: e.target.value })}
                                            placeholder="5.00"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            SIP-010 token contract address
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition disabled:opacity-50 font-medium text-lg shadow-lg"
                                >
                                    {loading ? 'Registering...' : 'Register Content'}
                                </button>
                            </form>
                        </div>
                    </TabsContent>

                    {/* My Content Tab */}
                    <TabsContent value="my-content">
                        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                            <h2 className="text-2xl font-bold mb-6">My Content</h2>
                            <MyContentList address={address || ''} />
                        </div>
                    </TabsContent>

                    {/* Earnings Tab */}
                    <TabsContent value="earnings">
                        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                            <h2 className="text-2xl font-bold mb-6">💰 Earnings</h2>
                            <div className="space-y-4">
                                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                                    <h3 className="text-lg font-bold text-green-800 mb-2">Total Earnings</h3>
                                    <p className="text-3xl font-black text-green-600">Coming Soon</p>
                                    <p className="text-sm text-gray-600 mt-2">Track your earnings from content sales</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>• View earnings by payment type (STX, USDCx)</p>
                                    <p>• Track individual content performance</p>
                                    <p>• See transaction history</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Bridge Tab */}
                    <TabsContent value="usdcx">
                        <SimpleBridge />
                    </TabsContent>
                </Tabs>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">💡 Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Upload your content to IPFS first and get the hash</li>
                        <li>• Set a fair price in STX for your content</li>
                        <li>• Optionally add USD pricing for USDCx payments</li>
                        <li>• Make sure your metadata URI is accessible</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
