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
    const { trackpadDimensions } = get();

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

    const now = Date.now();
    const lastUpdate = get().lastUpdate;

    if (lastUpdate === null || now - lastUpdate > 8) {
      const currentPoint = { x: transformedX, y: transformedY };
      const newPoints = [...get().points, currentPoint];

      const smoothedPoints = getStroke(
        [currentPoint].map((p) => [p.x, p.y]),
        {
          size: 30,
          thinning: 0.5, // Reduced from 10
          smoothing: 0.8, // Reduced from 20
          streamline: 0.5, // Reduced from 10
          last: true,
        }
      );

      if (smoothedPoints && smoothedPoints.length > 0) {
        const lastPoint = smoothedPoints[smoothedPoints.length - 1];
        if (Array.isArray(lastPoint) && lastPoint.length >= 2) {
          set({
            coordinates: { x: lastPoint[0], y: lastPoint[1] },
            points: newPoints.slice(-10), // Keep only last 10 points
            lastUpdate: now,
          });
        }
      }
    }
  },

  clearPoints: () => set({ points: [], lastUpdate: null }),
}));
