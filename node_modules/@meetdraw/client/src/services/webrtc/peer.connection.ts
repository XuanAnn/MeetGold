import {
  DEFAULT_RTC_CONFIGURATION,
  DATA_CHANNEL_LABEL,
  DATA_CHANNEL_CONFIG,
  DataChannelPacket,
} from '@meetdraw/shared';
import { ManagedDataChannel } from './data.channel';
import { PeerConnectionCallback } from './peer.types';
import { createLogger } from '../../utils/logger';

export class SinglePeerConnection {
  public readonly peerId: string;
  public readonly pc: RTCPeerConnection;
  private dataChannel: ManagedDataChannel | null = null;
  private remoteStream: MediaStream = new MediaStream();
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private isSettingRemoteDescription = false;
  private callbacks: PeerConnectionCallback;
  private log = createLogger('PeerConnection');

  constructor(peerId: string, callbacks: PeerConnectionCallback, config?: RTCConfiguration) {
    this.peerId = peerId;
    this.callbacks = callbacks;
    this.pc = new RTCPeerConnection(config || DEFAULT_RTC_CONFIGURATION);

    this.bindEvents();
  }

  private bindEvents() {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.log.network(`Generated ICE Candidate for peer ${this.peerId}`);
        this.callbacks.onIceCandidate(this.peerId, event.candidate);
      }
    };

    this.pc.onconnectionstatechange = () => {
      this.log.info(`Connection state with ${this.peerId}: ${this.pc.connectionState}`);
      this.callbacks.onConnectionStateChange(this.peerId, this.pc.connectionState);
    };

    this.pc.ontrack = (event) => {
      this.log.info(`Received remote track (${event.track.kind}) from ${this.peerId}`);
      event.streams[0]?.getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
      // In case no stream wrapper provided:
      if (event.streams.length === 0) {
        this.remoteStream.addTrack(event.track);
      }
      this.callbacks.onTrack(this.peerId, this.remoteStream);
    };

    this.pc.ondatachannel = (event) => {
      this.log.info(`Received remote DataChannel (${event.channel.label}) from ${this.peerId}`);
      this.dataChannel = new ManagedDataChannel(event.channel, this.peerId, {
        onWhiteboardEvent: this.callbacks.onWhiteboardEvent,
        onChatMessage: this.callbacks.onChatMessage,
        onOpen: () => this.callbacks.onDataChannelOpen(this.peerId),
        onClose: () => this.callbacks.onDataChannelClose(this.peerId),
      });
    };
  }

  // Caller creates data channel before creating offer
  initDataChannel(): ManagedDataChannel {
    const channel = this.pc.createDataChannel(DATA_CHANNEL_LABEL, DATA_CHANNEL_CONFIG);
    this.dataChannel = new ManagedDataChannel(channel, this.peerId, {
      onWhiteboardEvent: this.callbacks.onWhiteboardEvent,
      onChatMessage: this.callbacks.onChatMessage,
      onOpen: () => this.callbacks.onDataChannelOpen(this.peerId),
      onClose: () => this.callbacks.onDataChannelClose(this.peerId),
    });
    return this.dataChannel;
  }

  addLocalStream(stream: MediaStream) {
    stream.getTracks().forEach((track) => {
      try {
        this.pc.addTrack(track, stream);
      } catch (err) {
        this.log.warn(`Could not add track ${track.kind}:`, err);
      }
    });
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(sdp: RTCSessionDescriptionInit): Promise<void> {
    this.isSettingRemoteDescription = true;
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    this.isSettingRemoteDescription = false;

    // Flush any ICE candidates queued while waiting for remote description
    while (this.pendingCandidates.length > 0) {
      const candidate = this.pendingCandidates.shift();
      if (candidate) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => {
          this.log.warn(`Error applying queued ICE candidate for ${this.peerId}:`, err);
        });
      }
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.pc.remoteDescription && this.pc.remoteDescription.type) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  sendData(packet: DataChannelPacket): boolean {
    if (this.dataChannel && this.dataChannel.isOpen()) {
      return this.dataChannel.send(packet);
    }
    return false;
  }

  getDataChannel(): ManagedDataChannel | null {
    return this.dataChannel;
  }

  getRemoteStream(): MediaStream {
    return this.remoteStream;
  }

  close() {
    this.dataChannel?.close();
    this.remoteStream.getTracks().forEach((t) => t.stop());
    this.pc.close();
  }
}
