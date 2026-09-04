import { createLogger } from '../../utils/logger';

const log = createLogger('MediaStreamManager');

export class MediaStreamManager {
  private localStream: MediaStream | null = null;
  private isAudioMuted = false;
  private isVideoMuted = false;

  async getLocalMedia(video = true, audio = true): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    try {
      log.info(`Requesting user media (video: ${video}, audio: ${audio})...`);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      });

      this.localStream = stream;
      log.info('User media acquired successfully.');
      return stream;
    } catch (err: any) {
      log.warn(`Camera/Mic access failed (${err.name}: ${err.message}). Creating dummy silent/black stream.`);
      // If no mic/camera attached, create an empty stream so WebRTC connection doesn't fail
      const fallbackStream = new MediaStream();
      this.localStream = fallbackStream;
      return fallbackStream;
    }
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return false;

    this.isAudioMuted = !this.isAudioMuted;
    audioTracks.forEach((t) => {
      t.enabled = !this.isAudioMuted;
    });

    log.info(`Audio toggled: ${this.isAudioMuted ? 'MUTED' : 'UNMUTED'}`);
    return !this.isAudioMuted;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return false;

    this.isVideoMuted = !this.isVideoMuted;
    videoTracks.forEach((t) => {
      t.enabled = !this.isVideoMuted;
    });

    log.info(`Video toggled: ${this.isVideoMuted ? 'DISABLED' : 'ENABLED'}`);
    return !this.isVideoMuted;
  }

  getStream(): MediaStream | null {
    return this.localStream;
  }

  isAudioEnabled(): boolean {
    return !this.isAudioMuted;
  }

  isVideoEnabled(): boolean {
    return !this.isVideoMuted;
  }

  stopAll() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }
}

export const mediaStreamManager = new MediaStreamManager();
