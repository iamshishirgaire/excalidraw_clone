import rough from "roughjs";
import { Tool } from "@/types/tools";
import { DrawElement, Point, StrokeStyle } from "@/types/elements";

interface CreateElementProps {
  id?: string;
  type: Tool;
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  text?: string;
  isEraser?: boolean;
}

export const createElement = ({
  id = generateId(),
  type,
  points,
  strokeColor,
  strokeWidth,
  strokeStyle,
  roughness,
  text,
}: CreateElementProps): DrawElement => {
  const generator = rough.generator();
  let roughElement;

  const options = {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    strokeLineDash:
      strokeStyle === StrokeStyle.Dashed
        ? [12, 8]
        : strokeStyle === StrokeStyle.Dotted
        ? [2, 8]
        : undefined,
  };

  const [start, end] = points;

  switch (type) {
    case Tool.Rectangle: {
      roughElement = generator.rectangle(
        start.x,
        start.y,
        end.x - start.x,
        end.y - start.y,
        options
      );
      break;
    }
    case Tool.Diamond: {
      const width = end.x - start.x;
      const height = end.y - start.y;
      const points = [
        { x: start.x + width / 2, y: start.y },
        { x: start.x + width, y: start.y + height / 2 },
        { x: start.x + width / 2, y: start.y + height },
        { x: start.x, y: start.y + height / 2 },
      ];
      roughElement = generator.polygon(
        points.map((p) => [p.x, p.y]),
        options
      );
      break;
    }
    case Tool.Circle: {
      const width = end.x - start.x;
      const height = end.y - start.y;
      roughElement = generator.ellipse(
        start.x + width / 2,
        start.y + height / 2,
        width,
        height,
        options
      );
      break;
    }
    case Tool.Arrow: {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const angle = Math.atan2(dy, dx);
      const length = Math.sqrt(dx * dx + dy * dy);
      const headLength = Math.min(30, length / 3);
      const headAngle = Math.PI / 6;

      const headPoint1 = {
        x: end.x - headLength * Math.cos(angle - headAngle),
        y: end.y - headLength * Math.sin(angle - headAngle),
      };
      const headPoint2 = {
        x: end.x - headLength * Math.cos(angle + headAngle),
        y: end.y - headLength * Math.sin(angle + headAngle),
      };

      // Create a single path for the arrow
      const arrowPath = [
        [start.x, start.y],
        [end.x, end.y],
        [headPoint1.x, headPoint1.y],
        [end.x, end.y],
        [headPoint2.x, headPoint2.y],
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roughElement = generator.linearPath(arrowPath as any, options);
      break;
    }
    case Tool.Line: {
      roughElement = generator.line(start.x, start.y, end.x, end.y, options);
      break;
    }
    case Tool.Pencil: {
      // Convert points to SVG path commands
      const pathString = points
        .map((p, index) => {
          return index === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`;
        })
        .join(" ");

      roughElement = generator.path(pathString, options);
      break;
    }
    default:
      break;
  }

  return {
    id,
    type,
    points,
    roughElement,
    strokeColor,
    strokeWidth,
    strokeStyle,
    roughness,
    text,
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
