'use client';

import { useState, useEffect } from 'react';
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
    const [earnings, setEarnings] = useState({ totalStx: 0, totalUsdcx: 0, paymentCount: 0 });

    // Load earnings when address changes
    useEffect(() => {
        if (address) {
            loadEarnings();
        }
    }, [address]);

    const loadEarnings = async () => {
        if (!address) return;
        try {
            const response = await api.getCreatorRevenue(address);
            if (response.success && response.data) {
                setEarnings({
                    totalStx: response.data.earnings.totalStx,
                    totalUsdcx: response.data.earnings.totalUsdcx,
                    paymentCount: response.data.totalSales
                });
            }
        } catch (e) {
            console.error('Failed to load earnings:', e);
        }
    };

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

                <Tabs defaultValue="register" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-4 bg-transparent gap-4 p-0 h-auto">
                        <TabsTrigger value="register" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white bg-white neo-border neo-shadow-sm font-black uppercase tracking-wide py-3">
                            📝 Register
                        </TabsTrigger>
                        <TabsTrigger value="my-content" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-black bg-white neo-border neo-shadow-sm font-black uppercase tracking-wide py-3">
                            📚 My Content
                        </TabsTrigger>
                        <TabsTrigger value="earnings" className="data-[state=active]:bg-green-500 data-[state=active]:text-white bg-white neo-border neo-shadow-sm font-black uppercase tracking-wide py-3">
                            💰 Earnings
                        </TabsTrigger>
                        <TabsTrigger value="usdcx" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black bg-white neo-border neo-shadow-sm font-black uppercase tracking-wide py-3">
                            🌉 Bridge
                        </TabsTrigger>
                    </TabsList>

                    {/* Register Content Tab */}
                    <TabsContent value="register">
                        <div className="bg-white neo-border neo-shadow p-8">
                            <h2 className="text-3xl font-black mb-8 uppercase flex items-center gap-3">
                                <span className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center neo-border text-lg">1</span>
                                Register Content
                            </h2>

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 neo-border border-green-900 text-green-900 font-bold flex items-center gap-2">
                                    <span className="text-xl">✅</span> {success}
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 neo-border border-red-900 text-red-900 font-bold flex items-center gap-2">
                                    <span className="text-xl">⚠️</span> {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* File Upload Section */}
                                <div className="bg-gray-50 p-6 neo-border">
                                    <label className="block text-sm font-black uppercase text-gray-700 mb-4">
                                        Upload Content File
                                    </label>
                                    <FileUpload
                                        onUploadComplete={async (hash, gatewayUrl, isEncrypted) => {
                                            console.log('Upload complete:', { hash, gatewayUrl, isEncrypted });

                                            // Auto-generate metadata JSON with rich information
                                            const metadata = {
                                                title: `Premium Content - ${new Date().toLocaleDateString()}`,
                                                description: "Exclusive digital content available for purchase on the Stacks blockchain. High-quality content from verified creators.",
                                                author: address || 'Anonymous Creator',
                                                contentType: 'digital-asset',
                                                ipfsHash: hash,
                                                preview: gatewayUrl, // Use the uploaded file as preview
                                                createdAt: new Date().toISOString(),
                                                tags: ['premium', 'exclusive', 'digital-content'],
                                                // Add encryption flag to metadata if locked
                                                encrypted: isEncrypted
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
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 mb-2">
                                            IPFS Hash *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.ipfsHash}
                                            onChange={(e) => setFormData({ ...formData, ipfsHash: e.target.value })}
                                            placeholder="QmTest123..."
                                            className="w-full px-4 py-3 bg-white neo-border font-mono text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-500 mb-2">
                                            Price in STX *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                min="0"
                                                value={formData.priceStx}
                                                onChange={(e) => setFormData({ ...formData, priceStx: e.target.value })}
                                                placeholder="10.0"
                                                className="w-full px-4 py-3 bg-white neo-border font-bold text-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                                            />
                                            <div className="absolute right-3 top-3 font-black text-gray-400 pointer-events-none">STX</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata Generation */}
                                <MetadataForm
                                    onMetadataGenerated={(metadataUri) => {
                                        setFormData({ ...formData, metadataUri });
                                        setSuccess('Metadata generated and uploaded to IPFS!');
                                    }}
                                />

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">
                                        Metadata URI *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.metadataUri}
                                        onChange={(e) => setFormData({ ...formData, metadataUri: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-white neo-border font-mono text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>

                                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 neo-border border-cyan-200">
                                    <h3 className="text-lg font-black mb-4 uppercase text-cyan-900 flex items-center gap-2">
                                        <span className="bg-cyan-400 w-2 h-2"></span> Optional: Stablecoin Pricing
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase text-cyan-800 mb-2">
                                                Price in USD (USDCx)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.priceToken}
                                                    onChange={(e) => setFormData({ ...formData, priceToken: e.target.value })}
                                                    placeholder="5.00"
                                                    className="w-full px-4 py-3 bg-white neo-border border-cyan-900 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all"
                                                />
                                                <div className="absolute right-3 top-3 font-black text-gray-400 pointer-events-none">$</div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase text-cyan-800 mb-2">
                                                Token Contract
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.tokenContract}
                                                onChange={(e) => setFormData({ ...formData, tokenContract: e.target.value })}
                                                placeholder="STH..."
                                                className="w-full px-4 py-3 bg-white neo-border border-cyan-900 font-mono text-xs focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-black text-white neo-border neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 font-black uppercase text-xl tracking-widest"
                                >
                                    {loading ? 'Registering...' : '🚀 Register Content'}
                                </button>
                            </form>
                        </div>
                    </TabsContent>

                    {/* My Content Tab */}
                    <TabsContent value="my-content">
                        <div className="bg-white neo-border neo-shadow p-8">
                            <h2 className="text-3xl font-black mb-6 uppercase">My Content Library</h2>
                            <MyContentList address={address || ''} />
                        </div>
                    </TabsContent>

                    {/* Earnings Tab */}
                    <TabsContent value="earnings">
                        <div className="space-y-8">
                            <div className="bg-white neo-border neo-shadow p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-black uppercase">Earnings Overview</h2>
                                    <button onClick={loadEarnings} className="text-sm font-bold text-gray-500 hover:text-orange-500">
                                        ↻ Refresh
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* STX Card */}
                                    <div className="bg-gradient-to-br from-orange-500 to-pink-500 neo-border p-6 text-white">
                                        <div className="text-sm font-bold uppercase opacity-80 mb-1">STX Earned</div>
                                        <div className="text-4xl font-black">{(earnings.totalStx / 1000000).toFixed(2)} STX</div>
                                        <div className="text-xs font-mono mt-2 opacity-60">≈ MicroSTX: {earnings.totalStx}</div>
                                    </div>

                                    {/* USDCx Card */}
                                    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 neo-border p-6 text-white">
                                        <div className="text-sm font-bold uppercase opacity-80 mb-1">USDCx Earned</div>
                                        <div className="text-4xl font-black">${(earnings.totalUsdcx / 1000000).toFixed(2)}</div>
                                        <div className="text-xs font-mono mt-2 opacity-60">Stablecoin Revenue</div>
                                    </div>

                                    {/* Sales Card */}
                                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 neo-border p-6 text-white">
                                        <div className="text-sm font-bold uppercase opacity-80 mb-1">Total Sales</div>
                                        <div className="text-4xl font-black">{earnings.paymentCount}</div>
                                        <div className="text-xs font-mono mt-2 opacity-60">Completed Transactions</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Bridge Tab */}
                    <TabsContent value="usdcx">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <SimpleBridge />
                            </div>
                            <div className="bg-white neo-border neo-shadow p-6 h-fit">
                                <h3 className="font-black uppercase text-xl mb-4">Bridge Instructions</h3>
                                <p className="mb-4 text-sm font-medium">Use this tool to move USDC from Sepolia Ethereum Testnet to Stacks Testnet.</p>
                                <Link
                                    href="/bridge"
                                    className="block w-full text-center bg-yellow-300 py-3 font-black uppercase neo-border hover:bg-yellow-400 transition"
                                >
                                    Open Full Bridge Page ↗
                                </Link>
                            </div>
                        </div>
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
