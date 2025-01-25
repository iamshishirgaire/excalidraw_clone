import { Tool } from "@/types/tools";

export const getToolCursor = (tool: Tool): string => {
  switch (tool) {
    case Tool.Hand:
      return "grab";
    case Tool.Eraser:
      return "crosshair";

    case Tool.Pencil:
      return "pencil";
    default:
      return "crosshair";
  }
};
