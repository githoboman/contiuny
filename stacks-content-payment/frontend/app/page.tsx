'use client';

import Link from "next/link";
import { ArrowRight, Zap, Shield, Coins, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen grid-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="px-6 py-2 bg-yellow-300 neo-border neo-shadow-sm inline-block rotate-[-2deg]">
              <span className="font-bold text-sm uppercase tracking-wider">
                🚀 Powered by Stacks & USDCx
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
            <span className="block">PAY FOR</span>
            <span className="block gradient-text">CONTENT</span>
            <span className="block">YOUR WAY</span>
          </h1>

          <p className="text-xl md:text-2xl font-medium mb-12 max-w-2xl">
            Decentralized content payments on Bitcoin. Pay with <span className="font-black text-orange-500">STX</span> or <span className="font-black text-cyan-500">USDCx</span>. No middlemen. No BS.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/content"
              className="group px-8 py-5 bg-orange-500 text-white neo-border neo-shadow font-black text-lg uppercase tracking-wide transition-all neo-hover inline-flex items-center justify-center gap-2"
            >
              Browse Content
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/creators"
              className="px-8 py-5 bg-cyan-400 text-black neo-border neo-shadow font-black text-lg uppercase tracking-wide transition-all neo-hover inline-flex items-center justify-center gap-2"
            >
              Join Creators
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-white neo-border p-4 text-center">
              <div className="text-3xl font-black text-orange-500">100%</div>
              <div className="text-sm font-bold uppercase">Decentralized</div>
            </div>
            <div className="bg-white neo-border p-4 text-center">
              <div className="text-3xl font-black text-cyan-500">0%</div>
              <div className="text-sm font-bold uppercase">Platform Fees</div>
            </div>
            <div className="bg-white neo-border p-4 text-center">
              <div className="text-3xl font-black text-pink-500">∞</div>
              <div className="text-sm font-bold uppercase">Possibilities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black mb-16 text-center">
            WHY <span className="text-orange-500">COSTAXR</span>?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-orange-500 neo-border-thick p-8 rotate-[1deg] hover:rotate-0 transition-transform">
              <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase">Lightning Fast</h3>
              <p className="font-medium">
                Instant payments. Instant access. No waiting around.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-cyan-400 text-black neo-border-thick p-8 rotate-[-1deg] hover:rotate-0 transition-transform">
              <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase">Bitcoin Secure</h3>
              <p className="font-medium">
                Built on Stacks. Secured by Bitcoin. Trustless by design.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-yellow-300 text-black neo-border-thick p-8 rotate-[1deg] hover:rotate-0 transition-transform">
              <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                <Coins className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase">Dual Payments</h3>
              <p className="font-medium">
                Pay with STX or USDCx. Your wallet, your choice.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-pink-500 neo-border-thick p-8 rotate-[-1deg] hover:rotate-0 transition-transform">
              <div className="bg-white w-16 h-16 neo-border flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase">Creator First</h3>
              <p className="font-medium">
                100% of payments go to creators. No platform cuts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black mb-16 text-center">
            HOW IT <span className="gradient-text">WORKS</span>
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-orange-500 neo-border flex items-center justify-center">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <div className="bg-white neo-border p-6 flex-1">
                <h3 className="text-2xl font-black mb-2 uppercase">Connect Wallet</h3>
                <p className="font-medium text-gray-700">
                  Use Leather, Xverse, or Hiro. Takes 10 seconds.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-cyan-400 neo-border flex items-center justify-center">
                <span className="text-3xl font-black text-black">2</span>
              </div>
              <div className="bg-white neo-border p-6 flex-1">
                <h3 className="text-2xl font-black mb-2 uppercase">Find Content</h3>
                <p className="font-medium text-gray-700">
                  Browse premium articles, videos, and more from creators.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-yellow-300 neo-border flex items-center justify-center">
                <span className="text-3xl font-black text-black">3</span>
              </div>
              <div className="bg-white neo-border p-6 flex-1">
                <h3 className="text-2xl font-black mb-2 uppercase">Pay & Access</h3>
                <p className="font-medium text-gray-700">
                  Choose STX or USDCx. Confirm. Boom. Content unlocked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-cyan-400 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-white uppercase leading-tight">
              Ready to Start?
            </h2>
            <p className="text-2xl font-bold mb-12 text-white/90">
              Join the decentralized content revolution today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/content"
                className="px-10 py-6 bg-white text-black neo-border-thick neo-shadow-lg font-black text-xl uppercase tracking-wide transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                Explore Content
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                href="/creators"
                className="px-10 py-6 bg-black text-white neo-border-thick neo-shadow-lg font-black text-xl uppercase tracking-wide transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                Become Creator
                <Sparkles className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-3xl font-black mb-4">
            <span className="gradient-text">COSTAXR</span>
          </div>
          <p className="text-sm font-medium text-gray-400">
            Decentralized Content Payments • Built on Stacks • Secured by Bitcoin
          </p>
        </div>
      </div>
    </div>
  );
}
