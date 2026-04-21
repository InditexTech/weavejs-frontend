export type TextLayout = "auto" | "fixed-width" | "fixed";

export type TextAlignment = "left" | "center" | "right";

export type TextLimits = {
  width: number;
  height: number;
};

export type RichTextElement = {
  text: string;
  style?: string;
  size?: number;
  font?: string;
  decoration?: string;
  color?: string;
  align?: TextAlignment;
  lineHeight?: number;
};

export type RichTextModel = RichTextElement[];

export type RichTextRenderLine = {
  elementIndex: number;
  text: string;
  lineHeight: number;
  lineBaseline: number;
  lineSegments: TextSegment[];
  splitted: boolean;
};

export type Cursor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TextStyle = {
  font: string;
  size: number;
  style: string;
  decoration: string;
  align: TextAlignment;
  color: string;
  lineHeight: number;
};

export type TextSegment = {
  modelElementIndex: number;
  text: string;
  x: number;
  y: number;
  style: TextStyle;
};

export type LineColumn = {
  line: number;
  column: number;
};

export type MoveCursorAction = "add-line" | "delete-line" | "none";
