import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatStx(amount: number): string {
    return `${(amount / 1_000_000).toFixed(2)} STX`;
}

export function formatUsd(microUnits: number): string {
    return `$${(microUnits / 1_000_000).toFixed(2)}`;
}

export function shortenAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
}
