import { DataChannelPacket, WhiteboardEvent, ChatMessage } from '@meetdraw/shared';

export type PeerConnectionCallback = {
  onIceCandidate: (peerId: string, candidate: RTCIceCandidate) => void;
  onConnectionStateChange: (peerId: string, state: RTCPeerConnectionState) => void;
  onTrack: (peerId: string, stream: MediaStream) => void;
  onDataChannelOpen: (peerId: string) => void;
  onDataChannelClose: (peerId: string) => void;
  onWhiteboardEvent: (peerId: string, event: WhiteboardEvent) => void;
  onChatMessage: (peerId: string, message: ChatMessage) => void;
};
