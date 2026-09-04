import React from 'react';
import {
  Video,
  MessageSquare,
  Users,
  BarChart3,
  Download,
  Save,
} from 'lucide-react';

interface SidebarProps {
  isVideoOpen: boolean;
  setIsVideoOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isParticipantsOpen: boolean;
  setIsParticipantsOpen: (open: boolean) => void;
  isPollsOpen: boolean;
  setIsPollsOpen: (open: boolean) => void;
  onSaveSnapshot: () => void;
  onExportImage: () => void;
  unreadChatCount?: number;
  activePollsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isVideoOpen,
  setIsVideoOpen,
  isChatOpen,
  setIsChatOpen,
  isParticipantsOpen,
  setIsParticipantsOpen,
  isPollsOpen,
  setIsPollsOpen,
  onSaveSnapshot,
  onExportImage,
  unreadChatCount = 0,
  activePollsCount = 0,
}) => {
  return (
    <aside className="w-14 bg-navy-950 border-l border-navy-800 flex flex-col items-center py-3 justify-between z-20 select-none">
      {/* Top panel toggles */}
      <div className="flex flex-col space-y-3">
        {/* Video Grid Button */}
        <button
          onClick={() => setIsVideoOpen(!isVideoOpen)}
          className={`p-2.5 rounded-xl transition relative group ${
            isVideoOpen
              ? 'bg-indigo-accent text-white shadow-md shadow-indigo-accent/30'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
          title="Toggle Video Grid"
        >
          <Video size={18} />
          <span className="absolute right-14 bg-navy-900 text-[11px] text-slate-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap border border-navy-800 z-30">
            Video & Audio
          </span>
        </button>

        {/* Live Chat Button */}
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            if (!isChatOpen) {
              setIsPollsOpen(false);
              setIsParticipantsOpen(false);
            }
          }}
          className={`p-2.5 rounded-xl transition relative group ${
            isChatOpen
              ? 'bg-indigo-accent text-white shadow-md shadow-indigo-accent/30'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
          title="Toggle Live Chat"
        >
          <MessageSquare size={18} />
          {unreadChatCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-alert text-[10px] font-bold text-white rounded-full flex items-center justify-center">
              {unreadChatCount}
            </span>
          )}
          <span className="absolute right-14 bg-navy-900 text-[11px] text-slate-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap border border-navy-800 z-30">
            Live Chat (P2P)
          </span>
        </button>

        {/* Live Polls Button */}
        <button
          onClick={() => {
            setIsPollsOpen(!isPollsOpen);
            if (!isPollsOpen) {
              setIsChatOpen(false);
              setIsParticipantsOpen(false);
            }
          }}
          className={`p-2.5 rounded-xl transition relative group ${
            isPollsOpen
              ? 'bg-indigo-accent text-white shadow-md shadow-indigo-accent/30'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
          title="Toggle Live Polls"
        >
          <BarChart3 size={18} />
          {activePollsCount > 0 && !isPollsOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-light text-[10px] font-bold text-white rounded-full flex items-center justify-center">
              {activePollsCount}
            </span>
          )}
          <span className="absolute right-14 bg-navy-900 text-[11px] text-slate-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap border border-navy-800 z-30">
            Live Polls
          </span>
        </button>

        {/* Participants Button */}
        <button
          onClick={() => {
            setIsParticipantsOpen(!isParticipantsOpen);
            if (!isParticipantsOpen) {
              setIsChatOpen(false);
              setIsPollsOpen(false);
            }
          }}
          className={`p-2.5 rounded-xl transition relative group ${
            isParticipantsOpen
              ? 'bg-indigo-accent text-white shadow-md shadow-indigo-accent/30'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
          title="Toggle Participants"
        >
          <Users size={18} />
          <span className="absolute right-14 bg-navy-900 text-[11px] text-slate-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap border border-navy-800 z-30">
            Participants
          </span>
        </button>
      </div>

      {/* Bottom actions (Snapshot, Export) */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={onSaveSnapshot}
          className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-active hover:bg-navy-900 transition relative group"
          title="Save Snapshot to MySQL"
        >
          <Save size={18} />
          <span className="absolute right-14 bg-navy-900 text-[11px] text-slate-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap border border-navy-800 z-30">
            Save Snapshot
          </span>
        </button>

        <button
          onClick={onExportImage}
          className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-accent hover:bg-navy-900 transition relative group"
          title="Export Canvas PNG"
        >
          <Download size={18} />
          <span className="absolute right-14 bg-navy-900 text-[11px] text-slate-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap border border-navy-800 z-30">
            Export PNG
          </span>
        </button>
      </div>
    </aside>
  );
};
