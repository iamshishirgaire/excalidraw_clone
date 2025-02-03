import { useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useDrawingStore } from "@/store/drawingStore";
import { createElement } from "@/lib/drawing";
import { cn } from "@/lib/utils.ts";
import { getToolCursor } from "@/lib/cursors";
import { Tool } from "@/types/tools";
import { useCoordinateStore } from "@/store/coordinateStore";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
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
  }, [tool, eraserSize, elements, panOffset, zoom]);

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
  // const handleMouseUp = () => {
  //   setIsDrawing(false);
  //   setIsPanning(false);
  // };

  // const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
  //   const { offsetX, offsetY } = event.nativeEvent;
  //   setLastMousePosition({ x: offsetX, y: offsetY });
  //   if (tool === Tool.Eraser) {
  //     setIsDrawing(true);
  //   }
  //   if (tool === Tool.Hand) {
  //     setIsPanning(true);
  //   } else {
  //     setIsDrawing(true);

  //     const canvas = canvasRef.current;
  //     if (!canvas) return;

  //     const transformedX =
  //       (offsetX - canvas.width / 2 - panOffset.x) / (zoom / 100) +
  //       canvas.width / 2;
  //     const transformedY =
  //       (offsetY - canvas.height / 2 - panOffset.y) / (zoom / 100) +
  //       canvas.height / 2;

  //     const startPoint = { x: transformedX, y: transformedY };
  //     const element = createElement({
  //       type: tool,
  //       points: [startPoint, startPoint],
  //       strokeColor,
  //       strokeWidth,
  //       strokeStyle,
  //       roughness,
  //     });
  //     addElement(element);
  //   }
  // };
  // const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
  //   const { offsetX, offsetY } = event.nativeEvent;
  //   if (isPanning) {
  //     const deltaX = offsetX - lastMousePosition.x;
  //     const deltaY = offsetY - lastMousePosition.y;

  //     setPanOffset((prev) => ({
  //       x: prev.x + deltaX,
  //       y: prev.y + deltaY,
  //     }));

  //     setLastMousePosition({ x: offsetX, y: offsetY });
  //   }

  //   if (isDrawing) {
  //     const canvas = canvasRef.current;
  //     if (!canvas) return;

  //     const transformedX =
  //       (offsetX - canvas.width / 2 - panOffset.x) / (zoom / 100) +
  //       canvas.width / 2;
  //     const transformedY =
  //       (offsetY - canvas.height / 2 - panOffset.y) / (zoom / 100) +
  //       canvas.height / 2;

  //     const index = elements.length - 1;
  //     const currentElement = elements[index];
  //     if (!currentElement) return;

  //     if (tool === Tool.Pencil) {
  //       const updatedPoints = [
  //         ...currentElement.points,
  //         { x: transformedX, y: transformedY },
  //       ];
  //       const updatedElement = createElement({
  //         ...currentElement,
  //         points: updatedPoints,
  //       });
  //       updateElement(currentElement.id, updatedElement);
  //     } else {
  //       const updatedElement = createElement({
  //         ...currentElement,
  //         points: [
  //           currentElement.points[0],
  //           { x: transformedX, y: transformedY },
  //         ],
  //       });
  //       updateElement(currentElement.id, updatedElement);
  //     }
  //   }
  // };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, eraserSize]);
  // Add new state to track if touch is active
  const [isTouchActive, setIsTouchActive] = useState(false);

  // Remove onMouseDown, onMouseMove, onMouseUp handlers from canvas

  // Add effect to handle coordinate changes from Bluetooth
  useEffect(() => {
    if (coordinates.x === 0 && coordinates.y === 0) return; // Ignore initial state

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isTouchActive) {
      // Start new drawing when touch is detected
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
          type: tool === Tool.Eraser ? Tool.Pencil : tool, // Use Pencil for eraser
          points: [startPoint, startPoint],
          strokeColor:
            tool === Tool.Eraser ? getBackgroundColor() : strokeColor,
          strokeWidth: tool === Tool.Eraser ? eraserSize : strokeWidth,
          strokeStyle,
          roughness: tool === Tool.Eraser ? 0 : roughness, // Reduce roughness for eraser
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

        if (tool === Tool.Pencil || tool === Tool.Eraser) {
          const updatedPoints = [
            ...currentElement.points,
            { x: transformedX, y: transformedY },
          ];
          const updatedElement = createElement({
            ...currentElement,
            points: updatedPoints,
            strokeColor:
              tool === Tool.Eraser ? getBackgroundColor() : strokeColor,
            strokeWidth: tool === Tool.Eraser ? eraserSize : strokeWidth,
            roughness: tool === Tool.Eraser ? 0 : roughness,
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

  // Add effect to handle touch end (when coordinates stop being received)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleTouchEnd = () => {
      setIsTouchActive(false);
      setIsDrawing(false);
      setIsPanning(false);
    };

    if (isTouchActive) {
      // Reset touch active state if no coordinates are received for 100ms
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
      className={cn("absolute z-0 top-0 left-0 bg-background cursor-cell")}
    />
  );
};
function getBackgroundColor(): string {
  throw new Error("Function not implemented.");
}
