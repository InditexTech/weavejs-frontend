// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import type { WeaveStateElement } from "@inditextech/weave-types";
import type { TextHandler, TextProps, TextToolbarState } from "./types";

// Whole-node prop -> run marks that override it. Run marks win over node
// props when rendering, so a native node that still carries marks (e.g. one
// saved while rich text was enabled globally) would ignore the node-level
// change. Those marks are cleared together with the node prop.
const OVERRIDING_MARKS: Record<string, string[]> = {
  fontFamily: ["family"],
  fill: ["color"],
  fontSize: ["size"],
  fontStyle: ["bold", "italic"],
  textDecoration: ["underline", "strike"],
};

type Block = { runs?: { t: string; m?: Record<string, unknown> }[] };

function stripMarks(blocks: unknown, keys: string[]): unknown {
  if (!Array.isArray(blocks)) return blocks;
  return (blocks as Block[]).map((block) => ({
    ...block,
    runs: block.runs?.map((run) => {
      if (!run.m) return run;
      const m = { ...run.m };
      for (const k of keys) delete m[k];
      return Object.keys(m).length ? { ...run, m } : { t: run.t };
    }),
  }));
}

export function useTextToolbarActions(state: TextToolbarState | null) {
  const instance = useWeave((s) => s.instance);
  const node = useWeave((s) => s.selection.node);
  const actualAction = useWeave((s) => s.actions.actual);

  const handler = React.useMemo(
    () => instance?.getNodeHandler<TextHandler>("text"),
    [instance],
  );

  // Whole-node props (line height, alignment, and everything when not rich).
  const patchProps = React.useCallback(
    (patch: Partial<TextProps>) => {
      if (!instance || !state) return;
      if (state.mode === "create") {
        if (actualAction) {
          instance.updatePropsAction(actualAction, {
            ...state.props,
            ...patch,
          });
        }
        return;
      }
      if (!node) return;
      const overriding = state.rich
        ? []
        : Object.keys(patch).flatMap((k) => OVERRIDING_MARKS[k] ?? []);
      const extra =
        overriding.length && Array.isArray(node.props?.blocks)
          ? { blocks: stripMarks(node.props.blocks, overriding) }
          : {};
      instance.updateNode({
        ...node,
        props: { ...node.props, ...patch, ...extra },
      } as WeaveStateElement);
    },
    [instance, state, node, actualAction],
  );

  const richNode = state?.rich ? state.nodeInstance : undefined;

  const setFamily = React.useCallback(
    (value: string) => {
      if (richNode && handler) handler.applyMark(richNode, "family", value);
      else patchProps({ fontFamily: value });
    },
    [richNode, handler, patchProps],
  );

  const setColor = React.useCallback(
    (value: string) => {
      if (richNode && handler) handler.applyMark(richNode, "color", value);
      else patchProps({ fill: value });
    },
    [richNode, handler, patchProps],
  );

  const setSize = React.useCallback(
    (value: number) => {
      if (value <= 0) return;
      if (richNode && handler) {
        // While editing, size is a selection mark. Otherwise scale the node.
        if (state?.editing || !handler.setBaseFontSize) {
          handler.applyMark(richNode, "size", value);
        } else {
          handler.setBaseFontSize(richNode, value);
        }
      } else patchProps({ fontSize: value });
    },
    [richNode, handler, state?.editing, patchProps],
  );

  // Rich nodes: per-selection line height mark (multiplier). Native nodes:
  // whole-node prop.
  const setLineHeight = React.useCallback(
    (value: number) => {
      if (value <= 0) return;
      if (richNode && handler) handler.applyMark(richNode, "lineHeight", value);
      else patchProps({ lineHeight: value });
    },
    [richNode, handler, patchProps],
  );

  // Rich nodes: per-paragraph alignment. Native nodes: whole-node prop.
  const setAlign = React.useCallback(
    (value: "left" | "center" | "right") => {
      if (richNode && handler) handler.setAlign(richNode, value);
      else patchProps({ align: value });
    },
    [richNode, handler, patchProps],
  );

  const toggleFontStyle = React.useCallback(
    (token: "bold" | "italic") => {
      if (richNode && handler) {
        handler.toggleMark(richNode, token);
        return;
      }
      const items = (state?.props.fontStyle ?? "normal")
        .split(" ")
        .filter((e) => e !== "" && e !== "normal");
      const next = items.includes(token)
        ? items.filter((e) => e !== token)
        : [...items, token];
      patchProps({ fontStyle: next.length ? next.join(" ") : "normal" });
    },
    [richNode, handler, state?.props.fontStyle, patchProps],
  );

  const toggleDecoration = React.useCallback(
    (token: "underline" | "strike") => {
      if (richNode && handler) {
        handler.toggleMark(richNode, token);
        return;
      }
      const value = token === "strike" ? "line-through" : "underline";
      patchProps({
        textDecoration: state?.props.textDecoration === value ? "" : value,
      });
    },
    [richNode, handler, state?.props.textDecoration, patchProps],
  );

  // Returns an error message, or null on success.
  const applyLink = React.useCallback(
    (url: string | undefined): string | null => {
      if (!handler || !state?.nodeInstance) return null;
      if (richNode) {
        const ok = handler.applyMark(richNode, "link", url);
        return ok || url === undefined ? null : "Select some text first";
      }
      if (url === undefined) handler.removeLink?.(state.nodeInstance);
      else handler.setLink?.(state.nodeInstance, url);
      return null;
    },
    [handler, state?.nodeInstance, richNode],
  );

  return {
    handler,
    patchProps,
    setFamily,
    setColor,
    setSize,
    setLineHeight,
    setAlign,
    toggleFontStyle,
    toggleDecoration,
    applyLink,
  };
}
