// API Client for backend communication

import { Content, ApiResponse, PaginatedResponse, UserAccess } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        console.error('API Error:', error);

        // Create detailed error message
        let errorMessage = error.error || 'Request failed';
        if (error.details && Array.isArray(error.details)) {
            errorMessage += ': ' + error.details.join(', ');
        }

        const err = new Error(errorMessage) as any;
        err.response = { data: error };
        throw err;
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType);
        throw new Error('Server returned invalid response format');
    }

    return response.json();
}

export const api = {
    // Content endpoints
    async getAllContent(page = 1, limit = 20): Promise<PaginatedResponse<Content>> {
        return fetchApi(`/api/content?page=${page}&limit=${limit}`);
    },

    async getContent(id: number): Promise<ApiResponse<Content>> {
        return fetchApi(`/api/content/${id}`);
    },

    async getCreatorContent(address: string): Promise<ApiResponse<Content[]>> {
        return fetchApi(`/api/content/creator/${address}`);
    },

    async registerContent(data: {
        creator: string;
        ipfsHash: string;
        priceStx: number;
        metadataUri: string;
        priceToken?: number;
        tokenContract?: string;
    }): Promise<ApiResponse<{ contentId: number; txId: string }>> {
        return fetchApi('/api/content', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateContentPrice(
        id: number,
        creator: string,
        newPrice: number
    ): Promise<ApiResponse<{ success: boolean; txId: string }>> {
        return fetchApi(`/api/content/${id}/price`, {
            method: 'PUT',
            body: JSON.stringify({ creator, newPrice }),
        });
    },

    async deactivateContent(
        id: number,
        creator: string
    ): Promise<ApiResponse<{ success: boolean; txId: string }>> {
        return fetchApi(`/api/content/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ creator }),
        });
    },

    // Payment endpoints
    async processStxPayment(
        user: string,
        contentId: number
    ): Promise<ApiResponse<{ success: boolean; txId: string; receiptId?: number }>> {
        return fetchApi('/api/payment/stx', {
            method: 'POST',
            body: JSON.stringify({ user, contentId }),
        });
    },

    async processTokenPayment(
        user: string,
        contentId: number,
        tokenContract: string
    ): Promise<ApiResponse<{ success: boolean; txId: string; receiptId?: number }>> {
        return fetchApi('/api/payment/token', {
            method: 'POST',
            body: JSON.stringify({ user, contentId, tokenContract }),
        });
    },

    async verifyPayment(
        contentId: number,
        user: string
    ): Promise<ApiResponse<{ contentId: number; user: string; hasPaid: boolean }>> {
        return fetchApi(`/api/payment/verify/${contentId}/${user}`);
    },

    async getUserAccess(contentId: number, user: string): Promise<ApiResponse<UserAccess>> {
        return fetchApi(`/api/payment/access/${contentId}/${user}`);
    },

    async getUserPayments(address: string): Promise<ApiResponse<Array<{ contentId: number; access: UserAccess }>>> {
        return fetchApi(`/api/payment/user/${address}`);
    },

    async getUserPaymentStats(
        address: string
    ): Promise<ApiResponse<{ totalPayments: number; totalSpent: number; activeAccess: number }>> {
        return fetchApi(`/api/payment/user/${address}/stats`);
    },
};
