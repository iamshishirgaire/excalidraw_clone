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
      // Apply smoothing before generating the rough element
      const smoothedPoints = this.smoothPoints(element.points);
      return {
        ...element,
        points: element.points, // Keep original points for reference
        roughElement: this.createRoughElement({
          ...element,
          points: smoothedPoints,
        }),
      };
    }
    return element;
  }

  /**
   * Smooth the input points using filtering and stroke generation.
   */
  private smoothPoints(points: Point[]): Point[] {
    if (points.length < 2) return points;

    // Step 1: Remove redundant points with increased minimum distance
    const filteredPoints = this.filterRedundantPoints(points, 3);

    // Step 2: Apply moving average with larger window size
    const averagedPoints = this.applyMovingAverage(filteredPoints, 5);

    // Step 3: Apply Gaussian smoothing
    const gaussianSmoothed = this.applyGaussianSmoothing(averagedPoints, 2);

    // Step 4: Generate smooth stroke with adjusted parameters
    const stroke = getStroke(
      gaussianSmoothed.map((p) => [p.x, p.y]),
      {
        size: 4,
        thinning: 0.2, // Reduced for more consistent width
        smoothing: 0.85, // Increased for smoother curves
        streamline: 0.8, // Increased to reduce jitter
        easing: (t) => t * t, // Quadratic easing for smoother transitions
        last: true,
      }
    );

    return stroke.map(([x, y]) => ({ x, y }));
  }

  // Add new Gaussian smoothing method
  private applyGaussianSmoothing(points: Point[], sigma: number): Point[] {
    if (points.length < 3) return points;

    const kernel = this.generateGaussianKernel(sigma);
    const kernelSize = kernel.length;
    const halfSize = Math.floor(kernelSize / 2);

    return points.map((_, i, arr) => {
      let sumX = 0,
        sumY = 0,
        weightSum = 0;

      for (let j = -halfSize; j <= halfSize; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < arr.length) {
          const weight = kernel[j + halfSize];
          sumX += arr[idx].x * weight;
          sumY += arr[idx].y * weight;
          weightSum += weight;
        }
      }

      return {
        x: sumX / weightSum,
        y: sumY / weightSum,
      };
    });
  }

  private generateGaussianKernel(sigma: number): number[] {
    const size = Math.ceil(sigma * 6);
    const kernel = [];
    const center = size / 2;

    for (let i = 0; i < size; i++) {
      const x = i - center;
      kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    }

    return kernel;
  }

  // Update moving average with weighted values
  private applyMovingAverage(points: Point[], windowSize: number): Point[] {
    return points.map((_, i, arr) => {
      let sumX = 0,
        sumY = 0,
        totalWeight = 0;

      for (
        let j = Math.max(0, i - windowSize);
        j <= Math.min(arr.length - 1, i + windowSize);
        j++
      ) {
        // Apply higher weight to closer points
        const weight = 1 / (Math.abs(i - j) + 1);
        sumX += arr[j].x * weight;
        sumY += arr[j].y * weight;
        totalWeight += weight;
      }

      return {
        x: sumX / totalWeight,
        y: sumY / totalWeight,
      };
    });
  }

  /**
   * Filter out redundant points that are too close to each other.
   */
  private filterRedundantPoints(points: Point[], minDistance: number): Point[] {
    return points.filter((p, i, arr) => {
      if (i === 0) return true;
      const prev = arr[i - 1];
      return Math.hypot(p.x - prev.x, p.y - prev.y) > minDistance;
    });
  }

  /**
   * Create a rough.js element with the processed points.
   */
  private createRoughElement(element: DrawElement) {
    if (!element.points.length) return element.roughElement;
    return element.roughElement;
  }
}
