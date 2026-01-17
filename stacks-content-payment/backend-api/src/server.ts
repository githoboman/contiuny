// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('✓ .env file loaded successfully');
    console.log('PINATA_JWT exists:', !!process.env.PINATA_JWT);
}

// Now import everything else
import express, { Application } from 'express';
import cors from 'cors';
import contentRoutes from './routes/content.routes';
import paymentRoutes from './routes/payment.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Stacks Content Payment API',
        version: '1.0.0',
        endpoints: {
            content: '/api/content',
            payment: '/api/payment',
            health: '/health'
        },
        network: process.env.NETWORK || 'testnet',
        contracts: {
            contentRegistry: process.env.CONTENT_REGISTRY_ADDRESS,
            paymentHandler: process.env.PAYMENT_HANDLER_ADDRESS,
            accessControl: process.env.ACCESS_CONTROL_ADDRESS,
            mockUsdc: process.env.MOCK_USDC_ADDRESS
        }
    });
});

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Stacks Content Payment API                          ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Network: ${process.env.NETWORK || 'testnet'}                                    ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /health                                          ║
║   - GET  /api                                             ║
║   - POST /api/content                                     ║
║   - GET  /api/content/:id                                 ║
║   - POST /api/payment/stx                                 ║
║   - POST /api/payment/token                               ║
║   - GET  /api/payment/verify/:contentId/:user             ║
║                                                           ║
║   📚 Full API docs: http://localhost:${PORT}/api           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
