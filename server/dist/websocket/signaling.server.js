"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSignalingServer = initSignalingServer;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const signaling_handler_1 = require("./signaling.handler");
function initSignalingServer(httpServer) {
    const wss = new ws_1.WebSocketServer({ server: httpServer, path: '/signaling' });
    wss.on('connection', (ws, req) => {
        ws.isAlive = true;
        ws.peerId = (0, uuid_1.v4)();
        console.log(`[WebSocket] New client connected: ${ws.peerId} from ${req.socket.remoteAddress}`);
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        ws.on('message', (data) => {
            const rawString = data.toString('utf-8');
            signaling_handler_1.SignalingHandler.handleMessage(ws, ws.peerId, rawString);
        });
        ws.on('close', (code, reason) => {
            console.log(`[WebSocket] Client disconnected: ${ws.peerId} (Code: ${code}, Reason: ${reason})`);
            if (ws.peerId) {
                signaling_handler_1.SignalingHandler.handleLeaveRoom(ws.peerId);
            }
        });
        ws.on('error', (err) => {
            console.error(`[WebSocket] Socket error on peer ${ws.peerId}:`, err);
        });
    });
    // Heartbeat interval (30s) to prune dead connections
    const heartbeatInterval = setInterval(() => {
        wss.clients.forEach((client) => {
            const extWs = client;
            if (extWs.isAlive === false) {
                console.log(`[WebSocket] Terminating inactive connection: ${extWs.peerId}`);
                if (extWs.peerId) {
                    signaling_handler_1.SignalingHandler.handleLeaveRoom(extWs.peerId);
                }
                return extWs.terminate();
            }
            extWs.isAlive = false;
            extWs.ping();
        });
    }, 30000);
    wss.on('close', () => {
        clearInterval(heartbeatInterval);
    });
    console.log('[SignalingServer] WebSocket Signaling initialized at path /signaling');
    return wss;
}
