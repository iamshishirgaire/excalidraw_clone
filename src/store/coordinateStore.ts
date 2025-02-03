import { create } from "zustand";
import getStroke from "perfect-freehand";

interface Point {
  x: number;
  y: number;
}

interface CoordinateState {
  coordinates: Point;
  points: Point[];
  setCoordinates: (x: number, y: number) => void;
  clearPoints: () => void;
}

export const useCoordinateStore = create<CoordinateState>()((set, get) => ({
  coordinates: { x: 0, y: 0 },
  points: [],
  setCoordinates(x, y) {
    const { points } = get();
    const newPoints = [...points, { x, y }];

    if (newPoints.length > 10) {
      newPoints.shift();
    }

    const smoothedPoints = getStroke(
      newPoints.map((p) => [p.x, p.y]),
      {
        size: 8,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      }
    );

    if (smoothedPoints.length > 0) {
      const lastPoint = smoothedPoints[smoothedPoints.length - 1];
      set({
        coordinates: { x: lastPoint[0], y: lastPoint[1] },
        points: newPoints,
      });
    } else {
      set({
        coordinates: { x, y },
        points: newPoints,
      });
    }
  },
  clearPoints: () => set({ points: [] }),
}));
