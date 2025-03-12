import { getToolCursor } from "@/lib/cursors";
import { createElement } from "@/lib/drawing";
import { cn } from "@/lib/utils.ts";
import { useCoordinateStore } from "@/store/coordinateStore";
import { useDrawingStore } from "@/store/drawingStore";
import { Tool } from "@/types/tools";
import { useCallback, useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { isPointNearElement } from "@/lib/utils";

export const Canvas = () => {
  // Add requestAnimationFrame ref
  // Remove unused requestRef since it's not being used in the code
  // Remove unused prevTimeRef since it's not being used anywhere in the code

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isTouchActive, setIsTouchActive] = useState(false);

  const { coordinates } = useCoordinateStore();
  const {
    tool,
    elements,
    isDrawing,
    setEraserSize,
    strokeColor,
    strokeWidth,
    strokeStyle,
    roughness,
    eraserSize,
    zoom,
    setIsDrawing,
    addElement,
    updateElement,
  } = useDrawingStore();

  const drawEraserIndicator = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    },
    [eraserSize]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const roughCanvas = rough.canvas(canvas);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(panOffset.x, panOffset.y);
    ctx.translate(centerX, centerY);
    ctx.scale(zoom / 100, zoom / 100);
    ctx.translate(-centerX, -centerY);

    elements.forEach((element) => {
      if (element.roughElement) {
        roughCanvas.draw(element.roughElement);
      }
    });

    ctx.restore();

    if (
      tool === Tool.Eraser &&
      isTouchActive &&
      coordinates.x !== 0 &&
      coordinates.y !== 0
    ) {
      drawEraserIndicator(ctx, coordinates.x, coordinates.y);
    }
  }, [
    tool,
    eraserSize,
    elements,
    panOffset,
    zoom,
    coordinates,
    isTouchActive,
    drawEraserIndicator,
  ]);

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      return;
    }

    event.preventDefault();

    const deltaX = event.deltaX;
    const deltaY = event.deltaY;

    setPanOffset((prev) => ({
      x: prev.x - deltaX,
      y: prev.y - deltaY,
    }));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (tool === Tool.Eraser) {
      if (event.key === "+") {
        setEraserSize(eraserSize + 5);
      } else if (event.key === "-") {
        setEraserSize(eraserSize - 5);
      }
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tool, eraserSize]);

  const handleErase = useCallback(
    (x: number, y: number, canvas: HTMLCanvasElement) => {
      const transformedPoint = {
        x:
          (x - canvas.width / 2 - panOffset.x) / (zoom / 100) +
          canvas.width / 2,
        y:
          (y - canvas.height / 2 - panOffset.y) / (zoom / 100) +
          canvas.height / 2,
      };

      const remainingElements = elements.filter(
        (element) =>
          !isPointNearElement(transformedPoint, element, eraserSize / 2)
      );

      if (remainingElements.length !== elements.length) {
        useDrawingStore.setState({
          elements: remainingElements,
          history: [...useDrawingStore.getState().history, remainingElements],
          historyIndex: useDrawingStore.getState().historyIndex + 1,
        });
      }
    },
    [elements, panOffset, zoom, eraserSize]
  );

  useEffect(() => {
    if (coordinates.x === 0 && coordinates.y === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (tool === Tool.Eraser) {
      handleErase(coordinates.x, coordinates.y, canvas);
      return;
    }

    if (!isTouchActive) {
      setIsTouchActive(true);
      setLastMousePosition({ x: coordinates.x, y: coordinates.y });

      if (tool === Tool.Hand) {
        setIsPanning(true);
      } else {
        setIsDrawing(true);

        const transformedX =
          (coordinates.x - canvas.width / 2 - panOffset.x) / (zoom / 100) +
          canvas.width / 2;
        const transformedY =
          (coordinates.y - canvas.height / 2 - panOffset.y) / (zoom / 100) +
          canvas.height / 2;

        const startPoint = { x: transformedX, y: transformedY };
        const element = createElement({
          type: tool,
          points: [startPoint, startPoint],
          strokeColor: strokeColor,
          strokeWidth: strokeWidth,
          strokeStyle,
          roughness: roughness,
        });
        addElement(element);
      }
    } else {
      if (isPanning) {
        const deltaX = coordinates.x - lastMousePosition.x;
        const deltaY = coordinates.y - lastMousePosition.y;

        setPanOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));

        setLastMousePosition({ x: coordinates.x, y: coordinates.y });
      }

      if (isDrawing) {
        const transformedX =
          (coordinates.x - canvas.width / 2 - panOffset.x) / (zoom / 100) +
          canvas.width / 2;
        const transformedY =
          (coordinates.y - canvas.height / 2 - panOffset.y) / (zoom / 100) +
          canvas.height / 2;

        const index = elements.length - 1;
        const currentElement = elements[index];
        if (!currentElement) return;

        if ([Tool.Pencil, Tool.Eraser].includes(tool)) {
          const updatedPoints = [
            ...currentElement.points,
            { x: transformedX, y: transformedY },
          ];
          const updatedElement = createElement({
            ...currentElement,
            points: updatedPoints,
            roughness: roughness,
          });
          updateElement(currentElement.id, updatedElement);
        } else {
          const updatedElement = createElement({
            ...currentElement,
            points: [
              currentElement.points[0],
              { x: transformedX, y: transformedY },
            ],
          });
          updateElement(currentElement.id, updatedElement);
        }
      }
    }
  }, [coordinates]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleTouchEnd = () => {
      setIsTouchActive(false);
      setIsDrawing(false);
      setIsPanning(false);
    };

    if (isTouchActive) {
      timeoutId = setTimeout(handleTouchEnd, 100);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [coordinates, isTouchActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        cursor: isPanning ? "grabbing" : getToolCursor(tool),
        touchAction: "none",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
      className={cn(
        "canvas-element absolute z-0 top-0 left-0 bg-background cursor-cell"
      )}
    />
  );
};
