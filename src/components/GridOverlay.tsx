import { useDrawingStore } from "@/store/drawingStore";
import { useTheme } from "./ThemeProvider";

export const GridOverlay = () => {
  const { showGrid, zoom } = useDrawingStore();
  const { theme } = useTheme();
  if (!showGrid) return null;

  const gridSize = Math.max(20, 20 * (100 / zoom));

  return (
    <svg
      className="absolute z-10 inset-0 pointer-events-none"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke={
              theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
            }
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
};
