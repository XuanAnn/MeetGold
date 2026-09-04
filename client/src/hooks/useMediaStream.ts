import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaStreamManager } from '../services/webrtc.service';
import { LocalMediaState } from '../types';

export function useMediaStream(autoStart = true) {
  const [localState, setLocalState] = useState<LocalMediaState>({
    stream: null,
    isAudioMuted: false,
    isVideoMuted: false,
    isScreenSharing: false,
  });

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const startMedia = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await mediaStreamManager.getLocalMedia(video, audio);
      setLocalState({
        stream,
        isAudioMuted: !mediaStreamManager.isAudioEnabled(),
        isVideoMuted: !mediaStreamManager.isVideoEnabled(),
        isScreenSharing: false,
      });
      return stream;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      startMedia();
    }
    return () => {
      mediaStreamManager.stopAll();
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [autoStart, startMedia]);

  const toggleAudio = useCallback(() => {
    const isUnmuted = mediaStreamManager.toggleAudio();
    setLocalState((prev) => ({ ...prev, isAudioMuted: !isUnmuted }));
  }, []);

  const toggleVideo = useCallback(() => {
    const isEnabled = mediaStreamManager.toggleVideo();
    setLocalState((prev) => ({ ...prev, isVideoMuted: !isEnabled }));
  }, []);

  // Screen Share capability
  const startScreenShare = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: { ideal: 60, max: 60 },
        },
        audio: true,
      });

      setScreenStream(displayStream);
      setLocalState((prev) => ({ ...prev, isScreenSharing: true }));

      // Listen for browser native "Stop Sharing" button
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      return displayStream;
    } catch (err) {
      console.warn('Screen share canceled or failed:', err);
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    setLocalState((prev) => ({ ...prev, isScreenSharing: false }));
  }, [screenStream]);

  return {
    stream: localState.stream,
    screenStream,
    isAudioMuted: localState.isAudioMuted,
    isVideoMuted: localState.isVideoMuted,
    isScreenSharing: localState.isScreenSharing,
    toggleAudio,
    toggleVideo,
    startMedia,
    startScreenShare,
    stopScreenShare,
  };
}
