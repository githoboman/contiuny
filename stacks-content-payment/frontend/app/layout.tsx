import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { ReownProvider } from "@/components/wallet/reown-provider";
import { Header } from "@/components/layout/header";
import { StacksProvider } from '@/components/wallet/stacks-provider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stacks Content Payment Platform",
  description: "Pay for premium content with STX or xUSDC on the Stacks blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReownProvider>
          <StacksProvider>
            <WalletProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <footer className="border-t py-6 text-center text-sm text-gray-600">
                  <p>Stacks Content Payment Platform - Testnet</p>
                </footer>
              </div>
            </WalletProvider>
          </StacksProvider>
        </ReownProvider>
      </body>
    </html>
  );
}
