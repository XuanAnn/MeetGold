"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const env_1 = require("./config/env");
exports.app = (0, express_1.default)();
// Middleware
exports.app.use((0, cors_1.default)({ origin: true, credentials: true }));
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
exports.app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env_1.ENV.NODE_ENV,
    });
});
// REST Routes
exports.app.use('/api/auth', auth_routes_1.default);
exports.app.use('/api/rooms', room_routes_1.default);
// 404 Handler
exports.app.use('*', (req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});
