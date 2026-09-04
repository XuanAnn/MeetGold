import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, User as UserIcon } from 'lucide-react';

interface VideoTileProps {
  stream?: MediaStream | null;
  username: string;
  isLocal?: boolean;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
  userColor?: string;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  username,
  isLocal,
  isAudioMuted,
  isVideoMuted,
  userColor = '#38bdf8',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideoTrack = stream && stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live') && !isVideoMuted;

  return (
    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-md flex items-center justify-center group">
      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Local video must be muted to avoid feedback loop
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-inner"
            style={{ backgroundColor: userColor }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-400 font-medium">{username}</span>
        </div>
      )}

      {/* User tag and status overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        <div className="bg-gray-950/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] text-gray-200 font-medium flex items-center space-x-1 border border-gray-800">
          <span>{username}</span>
          {isLocal && <span className="text-[9px] text-sky-400 uppercase font-bold">(You)</span>}
        </div>

        <div className="flex items-center space-x-1">
          <div
            className={`p-1 rounded-md text-white backdrop-blur-sm ${
              isAudioMuted ? 'bg-rose-500/80' : 'bg-gray-950/60'
            }`}
          >
            {isAudioMuted ? <MicOff size={12} /> : <Mic size={12} />}
          </div>

          <div
            className={`p-1 rounded-md text-white backdrop-blur-sm ${
              isVideoMuted ? 'bg-rose-500/80' : 'bg-gray-950/60'
            }`}
          >
            {isVideoMuted ? <VideoOff size={12} /> : <Video size={12} />}
          </div>
        </div>
      </div>
    </div>
  );
};
