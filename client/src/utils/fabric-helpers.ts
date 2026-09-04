import { fabric } from 'fabric';
import { FabricObjectData } from '@meetdraw/shared';

// Extend Fabric Object to store custom id
declare module 'fabric' {
  namespace fabric {
    interface Object {
      id?: string;
    }
  }
}

export function generateObjectId(type: string): string {
  return `${type}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

export function serializeFabricObject(obj: fabric.Object): FabricObjectData {
  const json = obj.toObject(['id', 'name']);
  return {
    id: obj.id || generateObjectId(obj.type || 'object'),
    type: obj.type || 'rect',
    left: obj.left,
    top: obj.top,
    width: obj.width,
    height: obj.height,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
    angle: obj.angle,
    fill: typeof obj.fill === 'string' ? obj.fill : undefined,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    path: (obj as any).path,
    text: (obj as any).text,
    fontSize: (obj as any).fontSize,
    fontFamily: (obj as any).fontFamily,
    radius: (obj as any).radius,
    x1: (obj as any).x1,
    y1: (obj as any).y1,
    x2: (obj as any).x2,
    y2: (obj as any).y2,
    ...json,
  };
}

export function deserializeFabricObject(data: FabricObjectData): Promise<fabric.Object | null> {
  return new Promise((resolve) => {
    fabric.util.enlivenObjects(
      [data],
      (objects: fabric.Object[]) => {
        if (objects && objects.length > 0) {
          const obj = objects[0];
          obj.id = data.id;
          resolve(obj);
        } else {
          resolve(null);
        }
      },
      'fabric'
    );
  });
}
