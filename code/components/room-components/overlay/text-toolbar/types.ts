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
};

export type TextToolbarState = {
  /** Live Konva node; undefined in create mode. */
  nodeInstance: WeaveElementInstance | undefined;
  mode: "create" | "update";
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
