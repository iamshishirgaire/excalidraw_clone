import { Button } from "@/components/ui/button";
import { useDrawingStore } from "@/store/drawingStore";
import { Undo2, Redo2, Minus, Plus } from "lucide-react";

export const BottomPanel = () => {
  const { zoom, setZoom, undo, redo } = useDrawingStore();

  const handleZoomIn = () => setZoom(Math.min(200, zoom + 10));
  const handleZoomOut = () => setZoom(Math.max(10, zoom - 10));

  return (
    <div className="fixed z-20 bottom-4 left-[132px] transform -translate-x-1/2 flex gap-4 items-center">
      <div className="bg-popover/50 backdrop-blur-md h-9 border-border border rounded-lg shadow-lg  flex overflow-hidden ">
        <Button
          variant="ghost"
          size="icon"
          className="m-0 p-0 border-none rounded-none"
          onClick={undo}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <div className="h-full w-[1px] bg-border"></div>
        <Button
          variant="ghost"
          size="icon"
          className="p-0 m-0 border-none rounded-none"
          onClick={redo}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-popover/50 backdrop-blur-md h-9 border-border border rounded-lg shadow-lg  flex items-center overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="m-0 p-0 border-none rounded-none"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="h-full w-[1px] bg-border"></div>

        <span className="w-16 cursor-pointer text-center">{zoom}%</span>
        <div className="h-full w-[1px] bg-border"></div>

        <Button
          className="m-0 p-0 border-none rounded-none"
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
