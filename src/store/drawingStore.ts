import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tool } from "@/types/tools";
import { DrawElement, DrawElements, StrokeStyle } from "@/types/elements";

interface DrawingState {
  tool: Tool;
  offset: { x: number; y: number };
  elements: DrawElements;
  isDrawing: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  zoom: number;
  showGrid: boolean;
  history: DrawElements[];
  historyIndex: number;
  setTool: (tool: Tool) => void;
  addElement: (element: DrawElement) => void;
  updateElement: (id: string, element: DrawElement) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeStyle: (style: StrokeStyle) => void;
  setRoughness: (roughness: number) => void;
  setZoom: (zoom: number) => void;
  setShowGrid: (show: boolean) => void;
  undo: () => void;
  redo: () => void;
  eraserSize: number;
  reset: () => void;
  setEraserSize: (size: number) => void;
}

export const useDrawingStore = create<DrawingState>()(
  persist(
    (set) => ({
      isPanning: false,

      offset: { x: 2000, y: 2000 },
      tool: Tool.Pencil,
      elements: [],
      isDrawing: false,
      strokeColor: "#E63946",
      strokeWidth: 1,
      strokeStyle: StrokeStyle.Solid,
      roughness: 1,
      zoom: 100,
      showGrid: true,
      history: [],
      historyIndex: -1,
      setTool: (tool) => set({ tool }),
      addElement: (element) =>
        set((state) => {
          const newElements = [...state.elements, element];
          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            newElements,
          ];
          return {
            elements: newElements,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }),
      updateElement: (id, element) =>
        set((state) => ({
          elements: state.elements.map((el) => (el.id === id ? element : el)),
        })),
      reset: () => set({ elements: [], history: [], historyIndex: -1 }),
      setIsDrawing: (isDrawing) => set({ isDrawing }),
      setStrokeColor: (color) => set({ strokeColor: color }),
      setStrokeWidth: (width) => set({ strokeWidth: width }),
      setStrokeStyle: (style) => set({ strokeStyle: style }),
      setRoughness: (roughness) => set({ roughness }),
      setZoom: (zoom) => set({ zoom }),
      eraserSize: 20,
      setEraserSize: (size) =>
        set(() => ({
          eraserSize: Math.max(5, size),
        })),

      setShowGrid: (show) => set({ showGrid: show }),
      undo: () =>
        set((state) => ({
          historyIndex: Math.max(-1, state.historyIndex - 1),
          elements:
            state.historyIndex > 0 ? state.history[state.historyIndex - 1] : [],
        })),
      redo: () =>
        set((state) => ({
          historyIndex: Math.min(
            state.history.length - 1,
            state.historyIndex + 1
          ),
          elements:
            state.historyIndex < state.history.length - 1
              ? state.history[state.historyIndex + 1]
              : state.elements,
        })),
    }),
    {
      name: "drawing-storage",
    }
  )
);
