import { useDrawingStore } from "@/store/drawingStore";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

const ResetCanvas = () => {
  const { reset } = useDrawingStore();
  return (
    <div className="fixed z-20 top-4 right-10">
      <div className="bg-popover/50 backdrop-blur-md h-9 border-border border rounded-lg shadow-lg  flex overflow-hidden ">
        <Button
          variant="ghost"
          size="icon"
          className="m-0 p-0 border-none rounded-none"
          onClick={reset}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export default ResetCanvas;
