import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Decentralized Content Payment Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Pay for premium content with STX or xUSDC on the Stacks blockchain
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/content"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg"
            >
              Browse Content
            </Link>
            <Link
              href="/creator/dashboard"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-lg"
            >
              Creator Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Pay with STX or SIP-010 tokens directly from your wallet
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Instant Access</h3>
            <p className="text-gray-600">
              Get immediate access to content after payment confirmation
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Creator Earnings</h3>
            <p className="text-gray-600">
              Creators receive payments directly to their wallet
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600">
                  Use Hiro, Xverse, or Leather wallet to connect to the platform
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Browse Content</h3>
                <p className="text-gray-600">
                  Explore premium content from creators on the platform
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Make Payment</h3>
                <p className="text-gray-600">
                  Pay with STX or xUSDC tokens to unlock content
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Access Content</h3>
                <p className="text-gray-600">
                  Enjoy your purchased content immediately after confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join creators and readers on the decentralized content platform
          </p>
          <Link
            href="/content"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium text-lg"
          >
            Explore Content Now
          </Link>
        </div>
      </div>
    </div>
  );
}
