import { DrawElement, Point } from "@/types/elements";
import { Tool } from "@/types/tools";
import getStroke from "perfect-freehand";

export class DrawingService {
  private static instance: DrawingService;

  private constructor() {}

  static getInstance(): DrawingService {
    if (!DrawingService.instance) {
      DrawingService.instance = new DrawingService();
    }
    return DrawingService.instance;
  }

  processElement(element: DrawElement): DrawElement {
    if (element.type === Tool.Pencil) {
      // Keep original points for rough.js
      return {
        ...element,
        points: element.points,
        roughElement: this.createRoughElement({
          ...element,
          points: this.smoothPoints(element.points),
        }),
      };
    }
    return element;
  }

  private smoothPoints(points: Point[]): Point[] {
    if (points.length < 2) return points;

    const stroke = getStroke(
      points.map((p) => [p.x, p.y]),
      {
        size: 4,
        thinning: 0.3,
        smoothing: 0.2,
        streamline: 0.5,
        last: true,
      }
    );

    // Return only the outline points for path creation
    if (stroke.length > 0) {
      return stroke.map(([x, y]) => ({ x, y }));
    }

    return points;
  }

  private createRoughElement(element: DrawElement) {
    // Keep the original roughElement if smoothing fails
    if (!element.points.length) return element.roughElement;
    return element.roughElement;
  }
}
