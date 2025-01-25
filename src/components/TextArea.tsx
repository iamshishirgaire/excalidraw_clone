import { useEffect, useRef } from "react";
import { useDrawingStore } from "@/store/drawingStore";
import { Point } from "@/types/elements";

interface TextEditorProps {
  position: Point;
  onComplete: (text: string) => void;
}

export const TextEditor = ({ position, onComplete }: TextEditorProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { zoom } = useDrawingStore();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBlur = () => {
    if (inputRef.current) {
      onComplete(inputRef.current.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputRef.current) {
        onComplete(inputRef.current.value);
      }
    }
  };

  return (
    <textarea
      ref={inputRef}
      className="absolute bg-transparent border-none outline-none resize-none overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${zoom / 100})`,
        transformOrigin: "left top",
        fontSize: "16px",
        minWidth: "100px",
        minHeight: "24px",
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  );
};
