import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  Pen,
  Highlighter,
  Minus,
  Square,
  Circle as CircleIcon,
  Type,
  StickyNote,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { ToolType } from '@meetdraw/shared';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearCanvas: () => void;
  deleteSelected: () => void;
  zoomLevel?: number;
  zoomIn?: () => void;
  zoomOut?: () => void;
  resetZoom?: () => void;
}

const PRESET_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#c084fc', // purple
  '#ffffff', // white
];

const STROKE_WIDTHS = [2, 4, 8, 14];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  fillColor,
  setFillColor,
  undo,
  redo,
  canUndo,
  canRedo,
  clearCanvas,
  deleteSelected,
  zoomLevel = 100,
  zoomIn,
  zoomOut,
  resetZoom,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const tools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select & Move (V)', icon: <MousePointer size={17} /> },
    { id: 'pan', label: 'Pan Hand (H)', icon: <Hand size={17} /> },
    { id: 'pen', label: 'Pen (P)', icon: <Pen size={17} /> },
    { id: 'highlighter', label: 'Highlighter', icon: <Highlighter size={17} /> },
    { id: 'sticky', label: 'Sticky Note', icon: <StickyNote size={17} /> },
    { id: 'rect', label: 'Rectangle (R)', icon: <Square size={17} /> },
    { id: 'circle', label: 'Circle (O)', icon: <CircleIcon size={17} /> },
    { id: 'line', label: 'Line (L)', icon: <Minus size={17} /> },
    { id: 'text', label: 'Text (T)', icon: <Type size={17} /> },
    { id: 'eraser', label: 'Eraser', icon: <Eraser size={17} /> },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center bg-navy-900/90 backdrop-blur-xl border border-navy-700/80 p-1.5 rounded-2xl shadow-2xl space-x-1.5 max-w-[95vw] overflow-x-auto">
      {/* Drawing Tools */}
      <div className="flex items-center space-x-1 pr-2 border-r border-navy-800">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-2 rounded-xl transition flex items-center justify-center relative group ${
                isActive
                  ? 'bg-indigo-accent text-white shadow-md shadow-indigo-accent/30'
                  : 'text-slate-400 hover:text-white hover:bg-navy-800'
              }`}
              title={tool.label}
            >
              {tool.icon}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-navy-950 text-[11px] text-slate-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap border border-navy-800 z-30">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Color & Stroke Options */}
      <div className="flex items-center space-x-1.5 px-2 border-r border-navy-800 relative">
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-7 h-7 rounded-xl border-2 border-navy-700 flex items-center justify-center transition hover:scale-105"
            style={{ backgroundColor: strokeColor }}
            title="Choose Color"
          />

          {showColorPicker && (
            <div className="absolute top-10 left-0 bg-navy-900 border border-navy-700 p-2.5 rounded-xl shadow-2xl flex flex-col space-y-2 z-30">
              <div className="text-[10px] font-semibold text-slate-400">Palette</div>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setStrokeColor(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-lg transition hover:scale-110 ${
                      strokeColor === c ? 'ring-2 ring-indigo-light' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="text-[10px] font-semibold text-slate-400 pt-1">Fill Mode</div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setFillColor('transparent')}
                  className={`text-[10px] px-2 py-1 rounded flex-1 ${
                    fillColor === 'transparent' ? 'bg-indigo-accent text-white' : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  None
                </button>
                <button
                  onClick={() => setFillColor(strokeColor + '33')}
                  className={`text-[10px] px-2 py-1 rounded flex-1 ${
                    fillColor !== 'transparent' ? 'bg-indigo-accent text-white' : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  Tint
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center space-x-1 bg-navy-850 p-1 rounded-xl">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => setStrokeWidth(width)}
              className={`w-5 h-5 flex items-center justify-center rounded-lg transition ${
                strokeWidth === width ? 'bg-indigo-accent text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: `${Math.min(width * 1.3, 10)}px`, height: `${Math.min(width * 1.3, 10)}px` }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* History (Undo / Redo / Delete / Clear) */}
      <div className="flex items-center space-x-1 pr-2 border-r border-navy-800">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 disabled:opacity-30 transition"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 disabled:opacity-30 transition"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
        <button
          onClick={deleteSelected}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-alert hover:bg-navy-800 transition"
          title="Delete Selected"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={clearCanvas}
          className="text-[11px] px-2 py-1 rounded-xl text-slate-400 hover:text-rose-alert hover:bg-navy-800 transition font-medium"
          title="Clear Entire Canvas"
        >
          Clear
        </button>
      </div>

      {/* Zoom Controls */}
      {zoomIn && zoomOut && (
        <div className="flex items-center space-x-1 pl-1">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={resetZoom}
            className="text-[10px] font-mono font-bold text-slate-300 px-1.5 py-0.5 rounded bg-navy-850 hover:bg-navy-800 transition"
            title="Reset Zoom"
          >
            {zoomLevel}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
