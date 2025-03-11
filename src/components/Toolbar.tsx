import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { useDrawingStore } from "@/store/drawingStore";

export const Toolbar = () => {
  const { tool: selectedTool, setTool } = useDrawingStore();

  return (
    <div className="fixed z-20 top-4 left-1/2 transform -translate-x-1/2 bg-popover/50 backdrop-blur-md border-border border  rounded-lg shadow-lg p-2 flex gap-1">
      {tools.map(({ icon: Icon, tool }) => (
        <Button
          key={tool}
          variant={selectedTool === tool ? "secondary" : "ghost"}
          size="icon"
          className={cn(selectedTool === tool && " ring-2 ring-primary/20")}
          onClick={() => setTool(tool)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
};
