import { create } from "zustand";
import getStroke from "perfect-freehand";

interface Point {
  x: number;
  y: number;
}

interface CoordinateState {
  lastUpdate: number | null;
  coordinates: Point;
  points: Point[];
  setCoordinates: (x: number, y: number) => void;
  clearPoints: () => void;
  trackpadDimensions: { width: number; height: number };
}

export const useCoordinateStore = create<CoordinateState>()((set, get) => ({
  coordinates: { x: 0, y: 0 },
  points: [],
  trackpadDimensions: { width: 700, height: 400 },
  lastUpdate: null,

  setCoordinates: (x: number, y: number) => {
    const { points, trackpadDimensions } = get();

    // If it's a new stroke, reset points
    const newPoints = [...points];

    const scaleX = window.innerWidth / trackpadDimensions.width;
    const scaleY = window.innerHeight / trackpadDimensions.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledX = x * scale;
    const scaledY = y * scale;

    const offsetX = (window.innerWidth - trackpadDimensions.width * scale) / 2;
    const offsetY =
      (window.innerHeight - trackpadDimensions.height * scale) / 2;

    const transformedX = scaledX + offsetX;
    const transformedY = scaledY + offsetY;

    newPoints.push({ x: transformedX, y: transformedY });

    if (newPoints.length > 10) {
      newPoints.shift();
    }

    const now = Date.now();
    const lastUpdate = get().lastUpdate;
    if (lastUpdate === null || now - lastUpdate > 16) {
      const smoothedPoints = getStroke(
        newPoints.map((p) => [p.x, p.y]),
        {
          size: 8,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        }
      );

      if (smoothedPoints && smoothedPoints.length > 0) {
        const lastPoint = smoothedPoints[smoothedPoints.length - 1];
        if (Array.isArray(lastPoint) && lastPoint.length >= 2) {
          set({
            coordinates: { x: lastPoint[0], y: lastPoint[1] },
            points: newPoints,
            lastUpdate: now,
          });
        }
      }
    }
  },

  clearPoints: () => set({ points: [], lastUpdate: null }),
}));
