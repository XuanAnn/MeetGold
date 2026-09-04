export type ToolType =
  | 'select'
  | 'pan'
  | 'pen'
  | 'highlighter'
  | 'line'
  | 'rect'
  | 'circle'
  | 'text'
  | 'sticky'
  | 'eraser';

export type WhiteboardEventType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'CLEAR'
  | 'UNDO'
  | 'REDO'
  | 'CURSOR'
  | 'INIT_SYNC';

export interface WhiteboardEvent<T = unknown> {
  id: string;
  type: WhiteboardEventType;
  userId: string;
  timestamp: number;
  payload: T;
}

export interface FabricObjectData {
  id: string;
  type: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  path?: unknown;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  radius?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  [key: string]: unknown;
}

export interface ObjectCreatePayload {
  object: FabricObjectData;
}

export interface ObjectUpdatePayload {
  id: string;
  changes: Partial<FabricObjectData>;
}

export interface ObjectDeletePayload {
  ids: string[];
}

export interface CursorPayload {
  x: number;
  y: number;
  userId: string;
  username: string;
  color: string;
}

export interface CanvasSyncPayload {
  objects: FabricObjectData[];
}
