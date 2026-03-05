import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { ReownProvider } from "@/components/wallet/reown-provider";
import { Header } from "@/components/layout/header";
import { StacksProvider } from '@/components/wallet/stacks-provider';
import { XMTPProvider } from "@/components/chat/XMTPProvider";

export const metadata: Metadata = {
  title: "Stacks Content Payment Platform",
  description: "Pay for premium content with STX or xUSDC on the Stacks blockchain",
  other: {
    "talentapp:project_verification": "314136110029fc63738b62c058318c40931599f312a089be9d89ff17ea3b6017db5fa25d1b87a4d186174d39a7de7bf3f555b8e331d4d33a1122d9031f4254b7",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReownProvider>
          <StacksProvider>
            <WalletProvider>
              <XMTPProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <footer className="border-t py-6 text-center text-sm text-gray-600">
                    <p>Stacks Content Payment Platform - Testnet</p>
                  </footer>
                </div>
              </XMTPProvider>
            </WalletProvider>
          </StacksProvider>
        </ReownProvider>
      </body>
    </html>
  );
}
