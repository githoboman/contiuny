import { useWallet } from '@/components/wallet/wallet-provider';

export function useStacks() {
    const { address, isConnected } = useWallet();

    return {
        address,
        isConnected,
    };
}
