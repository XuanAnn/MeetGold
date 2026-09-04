import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { SignalingHandler } from './signaling.handler';

interface ExtWebSocket extends WebSocket {
  isAlive?: boolean;
  peerId?: string;
}

export function initSignalingServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/signaling' });

  wss.on('connection', (ws: ExtWebSocket, req) => {
    ws.isAlive = true;
    ws.peerId = uuidv4();

    console.log(`[WebSocket] New client connected: ${ws.peerId} from ${req.socket.remoteAddress}`);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      const rawString = data.toString('utf-8');
      SignalingHandler.handleMessage(ws, ws.peerId!, rawString);
    });

    ws.on('close', (code, reason) => {
      console.log(`[WebSocket] Client disconnected: ${ws.peerId} (Code: ${code}, Reason: ${reason})`);
      if (ws.peerId) {
        SignalingHandler.handleLeaveRoom(ws.peerId);
      }
    });

    ws.on('error', (err) => {
      console.error(`[WebSocket] Socket error on peer ${ws.peerId}:`, err);
    });
  });

  // Heartbeat interval (30s) to prune dead connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      const extWs = client as ExtWebSocket;
      if (extWs.isAlive === false) {
        console.log(`[WebSocket] Terminating inactive connection: ${extWs.peerId}`);
        if (extWs.peerId) {
          SignalingHandler.handleLeaveRoom(extWs.peerId);
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
