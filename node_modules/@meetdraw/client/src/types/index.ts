export * from '@meetdraw/shared';

export type WebRTCConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

export interface RemotePeerState {
  id: string;
  username: string;
  isHost?: boolean;
  connectionState: WebRTCConnectionState;
  stream?: MediaStream;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  dataChannelReady: boolean;
}

export interface LocalMediaState {
  stream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
}
