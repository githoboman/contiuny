# Backend API Documentation

## Overview

RESTful API for the Stacks Content Payment Platform. Enables content registration, payment processing, and access verification on the Stacks blockchain.

**Base URL:** `http://localhost:3000`  
**Network:** Testnet  
**Version:** 1.0.0

---

## Authentication

Currently, no authentication is required. Wallet signatures will be added in a future version.

---

## Endpoints

### Health Check

#### GET /health
Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-14T08:00:00.000Z",
  "environment": "development"
}
```

---

### API Info

#### GET /api
Get API information and available endpoints.

**Response:**
```json
{
  "success": true,
  "message": "Stacks Content Payment API",
  "version": "1.0.0",
  "endpoints": {
    "content": "/api/content",
    "payment": "/api/payment",
    "health": "/health"
  },
  "network": "testnet",
  "contracts": {
    "contentRegistry": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.content-registry",
    "paymentHandler": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.payment-handler",
    "accessControl": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.access-control",
    "mockUsdc": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.mock-usdc"
  }
}
```

---

## Content Endpoints

### Register Content

#### POST /api/content
Register new content on the blockchain.

**Request Body:**
```json
{
  "creator": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM",
  "ipfsHash": "QmTest123...",
  "priceStx": 1000000,
  "metadataUri": "https://example.com/metadata.json",
  "priceToken": 5000000,
  "tokenContract": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.mock-usdc"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": 1,
    "txId": "0x..."
  },
  "message": "Content registered successfully"
}
```

---

### Get Content

#### GET /api/content/:id
Get content details by ID.

**Parameters:**
- `id` (number) - Content ID

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": 1,
    "metadata": {
      "creator": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM",
      "ipfsHash": "QmTest123...",
      "priceStx": 1000000,
      "priceToken": 5000000,
      "tokenContract": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.mock-usdc",
      "metadataUri": "https://example.com/metadata.json",
      "createdAt": 12345,
      "isActive": true
    }
  }
}
```

---

### List All Content

#### GET /api/content
Get all active content (paginated).

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

---

### Update Content Price

#### PUT /api/content/:id/price
Update content price.

**Parameters:**
- `id` (number) - Content ID

**Request Body:**
```json
{
  "creator": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM",
  "newPrice": 2000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txId": "0x..."
  },
  "message": "Price updated successfully"
}
```

---

### Deactivate Content

#### DELETE /api/content/:id
Deactivate content.

**Parameters:**
- `id` (number) - Content ID

**Request Body:**
```json
{
  "creator": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM"
}
```

---

### Get Creator's Content

#### GET /api/content/creator/:address
Get all content by a specific creator.

**Parameters:**
- `address` (string) - Creator's Stacks address

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "contentId": 1,
      "metadata": {...}
    },
    {
      "contentId": 2,
      "metadata": {...}
    }
  ]
}
```

---

## Payment Endpoints

### Process STX Payment

#### POST /api/payment/stx
Process payment with STX.

**Request Body:**
```json
{
  "user": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "contentId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txId": "0x...",
    "receiptId": 1
  },
  "message": "STX payment processed successfully"
}
```

---

### Process Token Payment

#### POST /api/payment/token
Process payment with SIP-010 token (e.g., xUSDC).

**Request Body:**
```json
{
  "user": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "contentId": 1,
  "tokenContract": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM.mock-usdc"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "txId": "0x...",
    "receiptId": 2
  },
  "message": "Token payment processed successfully"
}
```

---

### Verify Payment

#### GET /api/payment/verify/:contentId/:user
Check if a user has paid for content.

**Parameters:**
- `contentId` (number) - Content ID
- `user` (string) - User's Stacks address

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": 1,
    "user": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "hasPaid": true
  }
}
```

---

### Get User Access

#### GET /api/payment/access/:contentId/:user
Get detailed access information for a user.

**Parameters:**
- `contentId` (number) - Content ID
- `user` (string) - User's Stacks address

**Response:**
```json
{
  "success": true,
  "data": {
    "user": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contentId": 1,
    "paidAmount": 1000000,
    "purchasedAt": 12345,
    "expiresAt": 23456
  }
}
```

---

### Get Payment Receipt

#### GET /api/payment/receipt/:id
Get payment receipt by ID.

**Parameters:**
- `id` (number) - Receipt ID

**Response:**
```json
{
  "success": true,
  "data": {
    "receiptId": 1,
    "user": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contentId": 1,
    "amount": 1000000,
    "timestamp": 12345,
    "txSender": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  }
}
```

---

### Get User Payments

#### GET /api/payment/user/:address
Get all payments made by a user.

**Parameters:**
- `address` (string) - User's Stacks address

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "contentId": 1,
      "access": {
        "user": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        "contentId": 1,
        "paidAmount": 1000000,
        "purchasedAt": 12345
      }
    }
  ]
}
```

---

### Get User Payment Stats

#### GET /api/payment/user/:address/stats
Get payment statistics for a user.

**Parameters:**
- `address` (string) - User's Stacks address

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPayments": 5,
    "totalSpent": 5000000,
    "activeAccess": 3
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": ["Additional error details"]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Rate Limiting

- **General API:** 100 requests per 15 minutes
- **Payment endpoints:** 10 requests per minute
- **Content registration:** 5 requests per minute

---

## Testing with cURL

### Register Content
```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "creator": "STH45SXAYXZR7ACA469PQD2YQEC678F3273KCYNM",
    "ipfsHash": "QmTest123",
    "priceStx": 1000000,
    "metadataUri": "https://example.com/metadata.json"
  }'
```

### Get Content
```bash
curl http://localhost:3000/api/content/1
```

### Verify Payment
```bash
curl http://localhost:3000/api/payment/verify/1/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

---

## Next Steps

1. Start the server: `npm run dev`
2. Test endpoints with cURL or Postman
3. Integrate with frontend
4. Add wallet signature authentication
5. Deploy to production
