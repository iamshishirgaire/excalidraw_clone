import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tool } from "@/types/tools";
import { DrawElement, DrawElements, StrokeStyle } from "@/types/elements";
import { DrawingService } from "@/services/drawingService";

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
  drawingService: DrawingService;
}

export const useDrawingStore = create<DrawingState>()(
  persist(
    (set, get) => ({
      isPanning: false,
      eraserSize: 20,
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
      setIsDrawing: (isDrawing) => set({ isDrawing }),
      setStrokeColor: (strokeColor) => set({ strokeColor }),
      setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
      setStrokeStyle: (strokeStyle) => set({ strokeStyle }),
      setRoughness: (roughness) => set({ roughness }),
      setZoom: (zoom) => set({ zoom }),
      setShowGrid: (showGrid) => set({ showGrid }),
      setEraserSize: (size) => set({ eraserSize: size }),
      reset: () => set({ elements: [], history: [], historyIndex: -1 }),
      undo: () =>
        set((state) => {
          if (state.historyIndex > 0) {
            return {
              elements: state.history[state.historyIndex - 1],
              historyIndex: state.historyIndex - 1,
            };
          }
          return state;
        }),
      redo: () =>
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            return {
              elements: state.history[state.historyIndex + 1],
              historyIndex: state.historyIndex + 1,
            };
          }
          return state;
        }),
      drawingService: DrawingService.getInstance(),

      addElement: (element) =>
        set((state) => {
          const processedElement = state.drawingService.processElement(element);
          const newElements = [...state.elements, processedElement];
          const newHistory = [
            ...state.history.slice(
              Math.max(0, state.historyIndex + 1 - 50),
              state.historyIndex + 1
            ),
            newElements,
          ];

          return {
            elements: newElements,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }),

      updateElement: (id, element) =>
        set((state) => {
          const elementIndex = state.elements.findIndex((el) => el.id === id);
          if (elementIndex === -1) return state;

          const processedElement = state.drawingService.processElement(element);
          const newElements = [...state.elements];
          newElements[elementIndex] = processedElement;

          if (element.type === Tool.Pencil && !get().isDrawing) {
            return {
              elements: newElements,
              history: [...state.history, newElements],
              historyIndex: state.history.length,
            };
          }

          return { elements: newElements };
        }),

      updateElements: (newElements: DrawElements) =>
        set((state) => {
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
    }),
    {
      name: "drawing-storage",
      partialize: (state) => ({
        elements: state.elements,
        tool: state.tool,
        strokeColor: state.strokeColor,
        strokeWidth: state.strokeWidth,
        strokeStyle: state.strokeStyle,
        roughness: state.roughness,
        eraserSize: state.eraserSize,
      }),
    }
  )
);
