'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { stacks } from '@/lib/stacks';
import { WalletState } from '@/types';

interface WalletContextType extends WalletState {
    connect: () => Promise<void>;
    disconnect: () => void;
    refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletState, setWalletState] = useState<WalletState>({
        address: null,
        isConnected: false,
        balance: 0,
    });

    useEffect(() => {
        // Check if wallet is already connected
        if (stacks.isConnected()) {
            const address = stacks.getAddress();
            if (address) {
                setWalletState(prev => ({ ...prev, address, isConnected: true }));
                stacks.getBalance(address).then(balance => {
                    setWalletState(prev => ({ ...prev, balance }));
                });
            }
        }
    }, []);

    const connect = async () => {
        try {
            const address = await stacks.connectWallet();
            const balance = await stacks.getBalance(address);
            setWalletState({ address, isConnected: true, balance });
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    };

    const disconnect = () => {
        stacks.disconnectWallet();
        setWalletState({ address: null, isConnected: false, balance: 0 });
    };

    const refreshBalance = async () => {
        if (walletState.address) {
            const balance = await stacks.getBalance(walletState.address);
            setWalletState(prev => ({ ...prev, balance }));
        }
    };

    return (
        <WalletContext.Provider value={{ ...walletState, connect, disconnect, refreshBalance }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
