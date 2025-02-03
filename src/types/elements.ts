import { Tool } from "./tools";

export interface Point {
  x: number;
  y: number;
}

export enum StrokeStyle {
  Solid = "solid",
  Dashed = "dashed",
  Dotted = "dotted",
}

export interface DrawElement {
  id: string;
  type: Tool;
  points: Point[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roughElement?: any;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  text?: string;
  isEraser?: boolean;
}

export type DrawElements = DrawElement[];
