import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Minus,
  Pencil,
  Square,
} from "lucide-react";
import { HandIcon } from "@radix-ui/react-icons";
import { Tool } from "@/types/tools";
export const tools = [
  { icon: HandIcon, tool: Tool.Hand },
  { icon: Square, tool: Tool.Rectangle },
  { icon: Diamond, tool: Tool.Diamond },
  { icon: Circle, tool: Tool.Circle },
  { icon: ArrowRight, tool: Tool.Arrow },
  { icon: Minus, tool: Tool.Line },
  { icon: Pencil, tool: Tool.Pencil },
  { icon: Eraser, tool: Tool.Eraser },
];
