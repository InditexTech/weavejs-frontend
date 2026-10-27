// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { WeaveElementInstance } from "@inditextech/weave-types";

// Local structural types for the rich-text API of WeaveTextV2Node
// (weave-sdk). They are not exported by the published SDK yet.
export type MarkKey =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "color"
  | "size"
  | "family"
  | "lineHeight"
  | "link";

export type BlockAlign = "left" | "center" | "right";

export type MarkQuery = { state: "all" | "none" | "some"; value?: unknown };

export type Range = { start: number; end: number };

export type SelectionFormat = {
  bold: MarkQuery;
  italic: MarkQuery;
  underline: MarkQuery;
  strike: MarkQuery;
  color: MarkQuery;
  size: MarkQuery;
  family: MarkQuery;
  link: MarkQuery;
  lineHeight: MarkQuery;
  align: { state: "all" | "none" | "some"; value?: BlockAlign };
  list: { kind: "ul" | "ol" | "none" | "mixed"; depth?: number };
};

export interface TextHandler {
  isRichTextEnabled(node?: WeaveElementInstance): boolean;
  getSelectionFormat(
    node: WeaveElementInstance,
    range?: Range,
  ): SelectionFormat;
  toggleMark(node: WeaveElementInstance, key: MarkKey, range?: Range): boolean;
  applyMark(
    node: WeaveElementInstance,
    key: MarkKey,
    value: unknown,
    range?: Range,
  ): boolean;
  toggleList(
    node: WeaveElementInstance,
    kind: "ul" | "ol",
    range?: Range,
  ): boolean;
  indent(node: WeaveElementInstance, range?: Range): boolean;
  outdent(node: WeaveElementInstance, range?: Range): boolean;
  setAlign(
    node: WeaveElementInstance,
    align: BlockAlign | undefined,
    range?: Range,
  ): boolean;
  setBaseFontSize?(node: WeaveElementInstance, px: number): boolean;
  getLink?(node: WeaveElementInstance): string | undefined;
  setLink?(node: WeaveElementInstance, url: string): void;
  removeLink?(node: WeaveElementInstance): void;
}

export type TextProps = {
  fontFamily?: string;
  fill?: string;
  fontSize?: number;
  lineHeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  align?: string;
  verticalAlign?: string;
  richText?: boolean;
  paddingX?: number;
  paddingY?: number;
};

export type TextToolbarState = {
  /** Live Konva node; undefined in create mode. */
  nodeInstance: WeaveElementInstance | undefined;
  mode: "create" | "update";
  /** Editing the internal label of a shape (rectangle, ellipse, polygon). */
  shapeLabel?: boolean;
  /** Live label edit session (shape label mode only). */
  labelSession?: LabelSession;
  editing: boolean;
  rich: boolean;
  format: SelectionFormat | null;
  props: TextProps;
};

export function isRichTextNode(props: Record<string, unknown>): boolean {
  return props.richText === true;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const LABEL_PROP_MAP: Record<keyof TextProps, string> = {
  fontFamily: "labelFontFamily",
  fill: "labelFill",
  fontSize: "labelFontSize",
  lineHeight: "labelLineHeight",
  fontStyle: "labelFontStyle",
  textDecoration: "labelTextDecoration",
  align: "labelAlign",
  verticalAlign: "labelVerticalAlign",
  richText: "labelRichText",
  paddingX: "labelPaddingX",
  paddingY: "labelPaddingY",
};

export const SHAPE_LABEL_TYPES = [
  "rectangle",
  "ellipse",
  "polygon",
  "regular-polygon",
];

export function labelPropsToTextProps(
  props: Record<string, unknown>,
): TextProps {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(LABEL_PROP_MAP)) {
    if (props[v] !== undefined) out[k] = props[v];
  }
  return out as TextProps;
}

export function textPatchToLabelProps(
  patch: Partial<TextProps>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    out[LABEL_PROP_MAP[k as keyof TextProps]] = v;
  }
  return out;
}

// Structural type of the SDK TextEditSession used by shape labels.
export interface LabelSession {
  setMark(key: MarkKey, value: unknown): void;
  toggleMark(key: MarkKey): void;
  toggleList(kind: "ul" | "ol"): void;
  setAlign(align: BlockAlign | undefined): void;
  indent(): void;
  outdent(): void;
  getFormat(): SelectionFormat;
}

/** Wraps a label edit session as a TextHandler (selection-based marks). */
export function createLabelHandler(
  session: LabelSession,
  baseFontSize: () => number,
): TextHandler {
  return {
    isRichTextEnabled: () => true,
    getSelectionFormat: () => session.getFormat(),
    toggleMark: (_n, key) => (session.toggleMark(key), true),
    applyMark: (_n, key, value) => {
      let v = value;
      if (key === "link" && typeof v === "string" && !isValidHttpUrl(v)) {
        return false;
      }
      if (key === "size" && typeof v === "number") {
        v = v / (baseFontSize() || 1);
      }
      session.setMark(key, v);
      return true;
    },
    toggleList: (_n, kind) => (session.toggleList(kind), true),
    indent: () => (session.indent(), true),
    outdent: () => (session.outdent(), true),
    setAlign: (_n, align) => (session.setAlign(align), true),
  } as TextHandler;
}
