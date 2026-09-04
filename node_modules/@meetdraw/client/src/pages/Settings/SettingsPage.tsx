import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Mic, Video, ShieldCheck, Check } from 'lucide-react';
import { useUserStore } from '../../stores/user.store';

export const SettingsPage: React.FC = () => {
  const { displayName, updateGuestName, userColor, setUserColor } = useUserStore();
  const [name, setName] = useState(displayName);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [hasCamPermission, setHasCamPermission] = useState<boolean | null>(null);

  const colors = [
    '#f87171',
    '#fb923c',
    '#facc15',
    '#4ade80',
    '#2dd4bf',
    '#38bdf8',
    '#818cf8',
    '#c084fc',
    '#f472b6',
  ];

  const testDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setHasMicPermission(stream.getAudioTracks().length > 0);
      setHasCamPermission(stream.getVideoTracks().length > 0);
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setHasMicPermission(false);
      setHasCamPermission(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col p-6">
      <div className="max-w-2xl w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gray-200 mb-6 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-2xl font-bold text-white mb-2">Settings & Diagnostics</h1>
        <p className="text-xs text-gray-400 mb-6">
          Configure profile preferences, WebRTC STUN/TURN servers, and test audio/video devices.
        </p>

        <div className="space-y-6">
          {/* User profile */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">User Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    updateGuestName(e.target.value);
                  }}
                  className="w-full bg-gray-800 text-gray-100 text-xs px-3 py-2 rounded-xl border border-gray-700"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Avatar Color</label>
                <div className="flex space-x-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setUserColor(c);
                        localStorage.setItem('meetdraw_user_color', c);
                      }}
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition hover:scale-110"
                      style={{ backgroundColor: c }}
                    >
                      {userColor === c && <Check size={14} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* WebRTC & Network Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <Server size={18} className="text-sky-400" />
              <h2 className="text-sm font-semibold text-white">WebRTC & NAT Traversal</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              ICE Candidate Gathering Configuration (STUN / TURN).
            </p>
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 font-mono text-[11px] text-gray-300 space-y-1">
              <div>STUN 1: stun:stun.l.google.com:19302 (Public Google STUN)</div>
              <div>STUN 2: stun:stun1.l.google.com:19302</div>
              <div>STUN 3: stun:stun2.l.google.com:19302</div>
              <div className="text-emerald-400 pt-1">Transport: UDP / SCTP / DTLS (DataChannel + SRTP)</div>
            </div>
          </div>

          {/* Hardware Device Diagnostics */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Hardware Diagnostics</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Verify microphone and webcam browser permissions.
            </p>

            <button
              onClick={testDevices}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-4 py-2 rounded-xl border border-gray-700 font-medium transition"
            >
              Test Microphone & Camera
            </button>

            {hasMicPermission !== null && (
              <div className="mt-3 flex space-x-4 text-xs">
                <span className={hasMicPermission ? 'text-emerald-400' : 'text-rose-400'}>
                  Mic: {hasMicPermission ? 'Authorized' : 'Unavailable/Denied'}
                </span>
                <span className={hasCamPermission ? 'text-emerald-400' : 'text-rose-400'}>
                  Camera: {hasCamPermission ? 'Authorized' : 'Unavailable/Denied'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
