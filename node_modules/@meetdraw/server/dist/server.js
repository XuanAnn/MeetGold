"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const signaling_server_1 = require("./websocket/signaling.server");
async function bootstrap() {
    // 1. Initialize Database connection (with graceful in-memory fallback)
    await (0, database_1.initDatabase)();
    // 2. Create HTTP Server
    const server = http_1.default.createServer(app_1.app);
    // 3. Initialize WebSocket Signaling Server
    (0, signaling_server_1.initSignalingServer)(server);
    // 4. Start Server
    server.listen(env_1.ENV.PORT, () => {
        console.log(`=========================================`);
        console.log(`🚀 MeetDraw Server running on http://localhost:${env_1.ENV.PORT}`);
        console.log(`📡 WebSocket Signaling at ws://localhost:${env_1.ENV.PORT}/signaling`);
        console.log(`=========================================`);
    });
}
bootstrap().catch((err) => {
    console.error('[Server Bootstrap Failed]:', err);
    process.exit(1);
});
