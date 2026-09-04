import React from 'react';
import { CursorPayload } from '@meetdraw/shared';

interface CanvasProps {
  canvasId: string;
  remoteCursors: Map<string, CursorPayload>;
}

export const Canvas: React.FC<CanvasProps> = ({ canvasId, remoteCursors }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-950 flex items-center justify-center select-none">
      <canvas id={canvasId} className="w-full h-full block" />

      {/* Floating Remote Cursors */}
      {Array.from(remoteCursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none transition-all duration-75 ease-out z-20"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor Pointer Icon */}
          <svg
            className="w-5 h-5 drop-shadow-md"
            viewBox="0 0 24 24"
            fill={cursor.color || '#38bdf8'}
            stroke="#ffffff"
            strokeWidth="1.5"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>

          {/* User Name Badge */}
          <div
            className="text-[11px] font-medium text-white px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap ml-3 -mt-2 border border-white/20"
            style={{ backgroundColor: cursor.color || '#38bdf8' }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </div>
  );
};
