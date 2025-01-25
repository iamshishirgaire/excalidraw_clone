import { create } from "zustand";

interface CoordinateState {
  coordinates: { x: number; y: number };
  setCoordinates: (x: number, y: number) => void;
}

export const useCoordinateStore = create<CoordinateState>()((set) => ({
  coordinates: { x: 0, y: 0 },
  setCoordinates(x, y) {
    set({ coordinates: { x, y } });
  },
}));
