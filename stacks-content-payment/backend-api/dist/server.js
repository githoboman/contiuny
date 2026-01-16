"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const content_routes_1 = __importDefault(require("./routes/content.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));
// Rate limiting
app.use('/api/', rateLimit_middleware_1.apiLimiter);
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
app.use('/api/content', content_routes_1.default);
app.use('/api/payment', payment_routes_1.default);
// Error handling
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
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
exports.default = app;
//# sourceMappingURL=server.js.map