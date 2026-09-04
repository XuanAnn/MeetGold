import { createLogger } from '../../utils/logger';

const log = createLogger('MediaStreamManager');

export type StreamUpdateListener = (stream: MediaStream) => void;

export class MediaStreamManager {
  private localStream: MediaStream | null = null;
  private isAudioMuted = false;
  private isVideoMuted = false;
  private listeners: Set<StreamUpdateListener> = new Set();

  onStreamUpdated(callback: StreamUpdateListener): () => void {
    this.listeners.add(callback);
    if (this.localStream) {
      callback(this.localStream);
    }
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(stream: MediaStream) {
    for (const listener of this.listeners) {
      try {
        listener(stream);
      } catch (err) {
        log.warn('Error in stream update listener:', err);
      }
    }
  }

  async getLocalMedia(video = true, audio = true): Promise<MediaStream> {
    // Check if existing localStream has live tracks
    const hasLiveAudio = !audio || (this.localStream && this.localStream.getAudioTracks().some((t) => t.readyState === 'live'));
    const hasLiveVideo = !video || (this.localStream && this.localStream.getVideoTracks().some((t) => t.readyState === 'live'));

    if (this.localStream && hasLiveAudio && hasLiveVideo) {
      return this.localStream;
    }

    // Stop any stale or ended tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => {
        if (t.readyState === 'ended') t.stop();
      });
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
      this.isAudioMuted = false;
      this.isVideoMuted = false;
      log.info(`User media acquired: ${stream.getAudioTracks().length} audio, ${stream.getVideoTracks().length} video.`);
      this.notifyListeners(stream);
      return stream;
    } catch (err: any) {
      log.warn(`Camera+Mic access failed (${err.name}: ${err.message}). Trying audio-only fallback...`);

      // 1. Fallback: Try microphone only (very common if camera is in use or unavailable)
      if (audio) {
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          // Generate a dummy canvas video track so video rendering components don't crash
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(0, 0, 640, 480);
            }
            const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(1) : new MediaStream();
            const dummyVideoTrack = canvasStream.getVideoTracks()[0];
            if (dummyVideoTrack) {
              audioOnlyStream.addTrack(dummyVideoTrack);
            }
          } catch {
            // ignore canvas fallback
          }

          this.localStream = audioOnlyStream;
          this.isAudioMuted = false;
          this.isVideoMuted = true;
          log.info('Audio-only microphone stream acquired successfully!');
          this.notifyListeners(audioOnlyStream);
          return audioOnlyStream;
        } catch (audioErr: any) {
          log.warn(`Audio-only fallback also failed: ${audioErr.name} (${audioErr.message})`);
        }
      }

      // 2. Fallback: Synthetic silent audio track if completely devoid of audio hardware
      const fallbackStream = new MediaStream();
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          const ctx = new AudioCtxClass();
          const osc = ctx.createOscillator();
          const dst = ctx.createMediaStreamDestination();
          const gain = ctx.createGain();
          gain.gain.value = 0.00001; // Silent
          osc.connect(gain);
          gain.connect(dst);
          osc.start();
          const silentAudioTrack = dst.stream.getAudioTracks()[0];
          if (silentAudioTrack) {
            fallbackStream.addTrack(silentAudioTrack);
          }
        }
      } catch {
        // ignore
      }

      this.localStream = fallbackStream;
      this.notifyListeners(fallbackStream);
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
