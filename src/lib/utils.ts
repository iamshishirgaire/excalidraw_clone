import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const isPointNearCurve = (
  point: { x: number; y: number },
  curvePoints: { x: number; y: number }[],
  threshold: number
): boolean => {
  for (let i = 0; i < curvePoints.length - 1; i++) {
    const start = curvePoints[i];
    const end = curvePoints[i + 1];

    // Calculate distance from point to line segment
    const a = point.x - start.x;
    const b = point.y - start.y;
    const c = end.x - start.x;
    const d = end.y - start.y;

    const dot = a * c + b * d;
    const lenSq = c * c + d * d;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = start.x;
      yy = start.y;
    } else if (param > 1) {
      xx = end.x;
      yy = end.y;
    } else {
      xx = start.x + param * c;
      yy = start.y + param * d;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < threshold) {
      return true;
    }
  }
  return false;
};
export const isPointNearElement = (
  point: { x: number; y: number },
  element: { points: { x: number; y: number }[] },
  threshold: number
): boolean => {
  for (let i = 0; i < element.points.length - 1; i++) {
    const start = element.points[i];
    const end = element.points[i + 1];

    const distance = getDistanceToLineSegment(point, start, end);
    if (distance < threshold) return true;
  }
  return false;
};

const getDistanceToLineSegment = (
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number }
): number => {
  const a = point.x - start.x;
  const b = point.y - start.y;
  const c = end.x - start.x;
  const d = end.y - start.y;

  const dot = a * c + b * d;
  const lenSq = c * c + d * d;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = start.x;
    yy = start.y;
  } else if (param > 1) {
    xx = end.x;
    yy = end.y;
  } else {
    xx = start.x + param * c;
    yy = start.y + param * d;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
};
