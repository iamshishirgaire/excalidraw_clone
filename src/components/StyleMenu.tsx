import { Button } from "@/components/ui/button";
import {
  MenuIcon,
  SaveIcon,
  SunIcon,
  MoonIcon,
  GridIcon,
  BanIcon,
} from "lucide-react";
import { FaRegSquare } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDrawingStore } from "@/store/drawingStore";
import { StrokeStyle } from "@/types/elements";
import { useTheme } from "@/components/ThemeProvider.tsx";
import { cn } from "@/lib/utils.ts";
import { PiRectangleDashedLight } from "react-icons/pi";
import { TbCircleDotted } from "react-icons/tb";

export const StyleMenu = () => {
  const {
    strokeColor,
    strokeWidth,
    strokeStyle,
    roughness,
    showGrid,
    setStrokeColor,
    setStrokeWidth,
    setStrokeStyle,
    setRoughness,
    setShowGrid,
  } = useDrawingStore();

  const { theme, setTheme } = useTheme();

  const strokeIcons = {
    [StrokeStyle.Solid]: <FaRegSquare className="h-4 w-4" />,
    [StrokeStyle.Dashed]: <PiRectangleDashedLight className="h-4 w-4 dash" />,
    [StrokeStyle.Dotted]: <TbCircleDotted className="h-4 w-4 dot" />,
  };

  const colors = ["#E63946", "#F4A261", "#2A9D8F", "#264653", "#8ECAE6"];

  const handleExportPDF = () => {
    if (typeof window !== "undefined") {
      const win = window as Window & {
        exportCanvasToPDF?: () => void;
      };
      if (win.exportCanvasToPDF) {
        win.exportCanvasToPDF();
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="absolute inset-x-0 z-20 left-5 top-5"
      >
        <Button variant="outline" size="icon">
          <MenuIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit mx-4 bg-stone-50/50 dark:bg-stone-900/50 backdrop-blur-md">
        <div className="p-2 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stroke Color</label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  style={{
                    backgroundColor: color,
                  }}
                  className={`w-8 h-8  rounded-lg border-2 ${
                    strokeColor === color
                      ? `border-blue-300 border-solid`
                      : "border-transparent"
                  }`}
                  onClick={() => setStrokeColor(color)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Stroke Width</label>
            <div className="flex space-x-2">
              {[1, 2, 4, 6, 8].map((width) => (
                <button
                  key={width}
                  className={`w-8 h-8 rounded-lg  ${
                    strokeWidth === width
                      ? " bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => setStrokeWidth(width)}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stroke Style</label>
            <div className="flex space-x-2">
              {Object.entries(strokeIcons).map(([style, icon]) => (
                <button
                  key={style}
                  className={cn(
                    "px-2 py-2 bg-gray-100 text-black rounded-lg",
                    strokeStyle === style ? "bg-blue-500 text-white" : ""
                  )}
                  onClick={() => setStrokeStyle(style as StrokeStyle)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Roughness */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Roughness</label>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={cn(
                    "px-3 py-1 bg-gray-100 rounded-lg",
                    roughness === value
                      ? "bg-blue-500 text-white"
                      : "text-gray-800"
                  )}
                  onClick={() => setRoughness(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grid</label>
            <div className="flex space-x-2">
              <button
                className={cn(
                  "px-2 py-2 bg-gray-100 rounded-lg",
                  showGrid ? "bg-blue-500 text-white" : "text-gray-800"
                )}
                onClick={() => setShowGrid(true)}
              >
                <GridIcon className="h-4 w-4" />
              </button>
              <button
                className={cn(
                  "px-2 py-2 bg-gray-100 rounded-lg",
                  !showGrid ? "bg-blue-500 text-white" : "text-gray-900"
                )}
                onClick={() => setShowGrid(false)}
              >
                <BanIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex space-x-2">
              <button
                className={`flex items-center p-2 rounded-lg ${
                  theme === "light"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setTheme("light")}
              >
                <SunIcon className="h-4 w-4" />
              </button>
              <button
                className={`flex items-center p-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setTheme("dark")}
              >
                <MoonIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Save Canvas as PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="w-full flex items-center justify-center"
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            Save as PDF
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
