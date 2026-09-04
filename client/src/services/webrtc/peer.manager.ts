import {
  DataChannelPacket,
  WhiteboardEvent,
  ChatMessage,
  PeerInfo,
  OfferPayload,
  AnswerPayload,
  IceCandidatePayload,
  UserJoinedPayload,
  UserLeftPayload,
  RoomJoinedPayload,
} from '@meetdraw/shared';
import { SinglePeerConnection } from './peer.connection';
import { PeerConnectionCallback } from './peer.types';
import { signalingService } from '../signaling.service';
import { mediaStreamManager } from './media.stream';
import { createLogger } from '../../utils/logger';

const log = createLogger('PeerManager');

export type PeerManagerListener = {
  onPeersUpdated?: (peers: string[]) => void;
  onRemoteStream?: (peerId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved?: (peerId: string) => void;
  onWhiteboardEvent?: (peerId: string, event: WhiteboardEvent) => void;
  onChatMessage?: (peerId: string, message: ChatMessage) => void;
  onPeerStateChange?: (peerId: string, state: RTCPeerConnectionState) => void;
};

export class PeerManager {
  private peers: Map<string, SinglePeerConnection> = new Map();
  private roomId: string | null = null;
  private listeners: PeerManagerListener = {};
  private unsubscribers: Array<() => void> = [];

  constructor() {}

  init(roomId: string, listeners: PeerManagerListener) {
    this.roomId = roomId;
    this.listeners = listeners;
    this.bindSignaling();
  }

  private bindSignaling() {
    // 1. When we join room and receive list of existing peers
    const unsubRoomJoined = signalingService.on<RoomJoinedPayload>('ROOM_JOINED', async (msg) => {
      if (!msg.payload) return;
      log.info(`Joined room ${msg.roomId}. Initiating connection to existing peers:`, msg.payload.peers);
      const existingPeers = msg.payload.peers;

      // As the new joiner, connect to existing peers by creating offers
      for (const peer of existingPeers) {
        await this.connectToPeer(peer.id, true);
      }
    });

    // 2. When another user joins the room
    const unsubUserJoined = signalingService.on<UserJoinedPayload>('USER_JOINED', async (msg) => {
      if (!msg.payload) return;
      log.info(`New user joined room: ${msg.payload.username} (${msg.payload.peerId})`);
      // The newly joined peer will send an offer to us, so we create our connection entry and await their offer
      this.getOrCreatePeer(msg.payload.peerId);
    });

    // 3. Offer received from a peer
    const unsubOffer = signalingService.on<OfferPayload>('OFFER', async (msg) => {
      if (!msg.payload) return;
      log.info(`Received OFFER from peer ${msg.senderId}`);
      const peer = this.getOrCreatePeer(msg.senderId);

      // Add local stream tracks if available
      const localStream = mediaStreamManager.getStream();
      if (localStream) {
        peer.addLocalStream(localStream);
      }

      await peer.setRemoteDescription(msg.payload.sdp);
      const answer = await peer.createAnswer();
      signalingService.sendAnswer(this.roomId!, msg.senderId, answer);
    });

    // 4. Answer received from a peer
    const unsubAnswer = signalingService.on<AnswerPayload>('ANSWER', async (msg) => {
      if (!msg.payload) return;
      log.info(`Received ANSWER from peer ${msg.senderId}`);
      const peer = this.peers.get(msg.senderId);
      if (peer) {
        await peer.setRemoteDescription(msg.payload.sdp);
      }
    });

    // 5. ICE candidate received
    const unsubIce = signalingService.on<IceCandidatePayload>('ICE_CANDIDATE', async (msg) => {
      if (!msg.payload) return;
      log.network(`Received ICE_CANDIDATE from peer ${msg.senderId}`);
      const peer = this.peers.get(msg.senderId);
      if (peer) {
        await peer.addIceCandidate(msg.payload.candidate);
      }
    });

    // 6. User left room
    const unsubUserLeft = signalingService.on<UserLeftPayload>('USER_LEFT', (msg) => {
      log.info(`Peer ${msg.senderId} left room. Cleaning up connection.`);
      this.removePeer(msg.senderId);
    });

    this.unsubscribers = [unsubRoomJoined, unsubUserJoined, unsubOffer, unsubAnswer, unsubIce, unsubUserLeft];
  }

  private async connectToPeer(peerId: string, isInitiator: boolean) {
    const peer = this.getOrCreatePeer(peerId);

    // Add local media stream
    const localStream = mediaStreamManager.getStream();
    if (localStream) {
      peer.addLocalStream(localStream);
    }

    if (isInitiator) {
      peer.initDataChannel();
      const offer = await peer.createOffer();
      signalingService.sendOffer(this.roomId!, peerId, offer);
    }
  }

  private getOrCreatePeer(peerId: string): SinglePeerConnection {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId)!;
    }

    const callbacks: PeerConnectionCallback = {
      onIceCandidate: (pId, candidate) => {
        if (this.roomId) {
          signalingService.sendIceCandidate(this.roomId, pId, candidate.toJSON());
        }
      },
      onConnectionStateChange: (pId, state) => {
        if (this.listeners.onPeerStateChange) {
          this.listeners.onPeerStateChange(pId, state);
        }
        if (state === 'failed' || state === 'closed') {
          this.removePeer(pId);
        }
      },
      onTrack: (pId, stream) => {
        if (this.listeners.onRemoteStream) {
          this.listeners.onRemoteStream(pId, stream);
        }
      },
      onDataChannelOpen: (pId) => {
        log.info(`DataChannel ready with ${pId}`);
      },
      onDataChannelClose: (pId) => {
        log.info(`DataChannel closed with ${pId}`);
      },
      onWhiteboardEvent: (pId, event) => {
        if (this.listeners.onWhiteboardEvent) {
          this.listeners.onWhiteboardEvent(pId, event);
        }
      },
      onChatMessage: (pId, msg) => {
        if (this.listeners.onChatMessage) {
          this.listeners.onChatMessage(pId, msg);
        }
      },
    };

    const newPeer = new SinglePeerConnection(peerId, callbacks);
    this.peers.set(peerId, newPeer);

    if (this.listeners.onPeersUpdated) {
      this.listeners.onPeersUpdated(Array.from(this.peers.keys()));
    }

    return newPeer;
  }

  removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.close();
      this.peers.delete(peerId);
      if (this.listeners.onRemoteStreamRemoved) {
        this.listeners.onRemoteStreamRemoved(peerId);
      }
      if (this.listeners.onPeersUpdated) {
        this.listeners.onPeersUpdated(Array.from(this.peers.keys()));
      }
    }
  }

  // Broadcast data packet to all peers in the mesh
  broadcastData(packet: DataChannelPacket): number {
    let sentCount = 0;
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.sendData(packet)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  broadcastWhiteboardEvent(event: WhiteboardEvent) {
    const packet: DataChannelPacket = {
      type: 'WHITEBOARD',
      payload: event,
    };
    this.broadcastData(packet);
  }

  broadcastChatMessage(msg: ChatMessage) {
    const packet: DataChannelPacket = {
      type: 'CHAT',
      payload: msg,
    };
    this.broadcastData(packet);
  }

  broadcastCursor(cursor: WhiteboardEvent) {
    const packet: DataChannelPacket = {
      type: 'CURSOR',
      payload: cursor,
    };
    this.broadcastData(packet);
  }

  // Attach new local media stream (e.g. after user grants permission or screen share)
  updateLocalStream(stream: MediaStream) {
    for (const peer of this.peers.values()) {
      peer.addLocalStream(stream);
    }
  }

  getConnectedPeerCount(): number {
    return this.peers.size;
  }

  cleanup() {
    this.unsubscribers.forEach((u) => u());
    this.unsubscribers = [];
    for (const peer of this.peers.values()) {
      peer.close();
    }
    this.peers.clear();
    this.roomId = null;
  }
}

export const peerManager = new PeerManager();
