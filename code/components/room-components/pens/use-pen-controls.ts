// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import {
  BRUSH_INSTRUMENTS,
  type WeaveBrushToolAction,
} from "@inditextech/weave-sdk";
import { PENS_AND_ERASER_ENABLED } from "@/lib/pens-eraser/flag";
import {
  BRUSH_MIN_SIZE,
  BRUSH_TOOL,
  clampBrushSize,
  clampOpacity,
  isPenBarTool,
  toInk,
  toStrokeColor,
} from "@/lib/pens-eraser/pen-bar";
import { sortPens } from "@/lib/pens-eraser/pen-defaults";
import { STROKE_ERASER_TOOL } from "@/lib/pens-eraser/tool";
import {
  STROKE_ERASER_DEFAULT_SIZE,
  clampEraserSize,
} from "@/lib/pens-eraser/size";
import { inkFor, usePens } from "@/store/pens";
import { applyPenMemory } from "./pen-sdk";

type PenOption = { id: string; label: string };

const PENS: PenOption[] = sortPens(
  BRUSH_INSTRUMENTS.map((p: PenOption) => ({ id: p.id, label: p.label })),
);

type PropsPayload = {
  instance?: { getName?: () => string };
  props?: Record<string, unknown>;
};

/**
 * Applies what the bar remembers whenever the brush becomes the active tool,
 * wherever that was started from. Mounted once per layout.
 */
export function usePenMemorySync(enabled = PENS_AND_ERASER_ENABLED) {
  const instance = useWeave((state) => state.instance);

  React.useEffect(() => {
    if (!enabled || !instance) return;
    const handle = (action: string | undefined) => {
      if (action !== BRUSH_TOOL) return;
      const brush = instance.getActionHandler<WeaveBrushToolAction>(BRUSH_TOOL);
      if (brush) applyPenMemory(instance, brush);
    };
    instance.addEventListener("onActiveActionChange", handle);
    return () => instance.removeEventListener("onActiveActionChange", handle);
  }, [enabled, instance]);
}

/**
 * State and actions shared by the pen bar and the sidebar. The pen, the size,
 * the opacity and the colour are held by the tools (read back from their
 * `onPropsChange` events); the bar only adds what the SDK does not remember.
 */
export function usePenControls(enabled = PENS_AND_ERASER_ENABLED) {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const active = enabled && isPenBarTool(actualAction);
  const eraserActive = actualAction === STROKE_ERASER_TOOL;

  const pen = usePens((s) => s.pen);
  const ink = usePens((s) => s.ink);
  const inks = usePens((s) => s.inks);

  const [size, setSize] = React.useState(BRUSH_MIN_SIZE);
  const [opacity, setOpacity] = React.useState(1);
  const [color, setColor] = React.useState("#000000ff");
  const [eraserSize, setEraserSize] = React.useState(
    STROKE_ERASER_DEFAULT_SIZE,
  );

  const getBrush = React.useCallback(
    () => instance?.getActionHandler<WeaveBrushToolAction>(BRUSH_TOOL),
    [instance],
  );

  React.useEffect(() => {
    if (!active || !instance) return;

    const readBrush = (props: Record<string, unknown> | undefined) => {
      if (typeof props?.strokeWidth === "number") setSize(props.strokeWidth);
      if (typeof props?.opacity === "number") setOpacity(props.opacity);
      if (typeof props?.stroke === "string") {
        setColor(toStrokeColor(props.stroke));
      }
    };
    const readEraser = (props: Record<string, unknown> | undefined) => {
      if (typeof props?.size === "number") setEraserSize(props.size);
    };

    const brush = getBrush();
    readBrush(brush?.getProps());
    readEraser(
      instance
        .getActionHandler<{ getProps(): Record<string, unknown> }>(
          STROKE_ERASER_TOOL,
        )
        ?.getProps(),
    );
    const current = brush?.getInstrument();
    if (!usePens.getState().pen && current && current !== "custom") {
      usePens.getState().setPen(current);
    }

    const handle = (payload: PropsPayload) => {
      const name = payload?.instance?.getName?.();
      if (name === BRUSH_TOOL) readBrush(payload.props);
      if (name === STROKE_ERASER_TOOL) readEraser(payload.props);
    };
    instance.addEventListener("onPropsChange", handle);
    return () => instance.removeEventListener("onPropsChange", handle);
  }, [active, instance, getBrush]);

  const selectPen = React.useCallback(
    (id: string) => {
      const brush = getBrush();
      if (!instance || !brush) return;
      usePens.getState().setPen(id);
      if (actualAction !== BRUSH_TOOL) instance.triggerAction(BRUSH_TOOL);
      applyPenMemory(instance, brush);
    },
    [instance, actualAction, getBrush],
  );

  const selectEraser = React.useCallback(() => {
    if (!instance || actualAction === STROKE_ERASER_TOOL) return;
    instance.triggerAction(STROKE_ERASER_TOOL);
  }, [instance, actualAction]);

  const changeSize = React.useCallback(
    (value: number) => {
      if (!instance) return;
      if (actualAction === STROKE_ERASER_TOOL) {
        const next = clampEraserSize(value);
        setEraserSize(next);
        instance.updatePropsAction(STROKE_ERASER_TOOL, { size: next });
        return;
      }
      const next = clampBrushSize(value);
      setSize(next);
      const current = usePens.getState().pen;
      if (current) usePens.getState().setTuned(current, { size: next });
      instance.updatePropsAction(BRUSH_TOOL, { strokeWidth: next });
      const brush = getBrush();
      if (brush && current) {
        // The pen's tapers are scaled from the width, and applying it again
        // resets the opacity: write the opacity back.
        brush.setInstrument(current as never);
        const tunedOpacity = usePens.getState().tuned[current]?.opacity;
        if (tunedOpacity !== undefined) {
          instance.updatePropsAction(BRUSH_TOOL, { opacity: tunedOpacity });
        }
      }
    },
    [instance, actualAction, getBrush],
  );

  const changeOpacity = React.useCallback(
    (value: number) => {
      if (!instance) return;
      const next = clampOpacity(value);
      setOpacity(next);
      const current = usePens.getState().pen;
      if (current) usePens.getState().setTuned(current, { opacity: next });
      instance.updatePropsAction(BRUSH_TOOL, { opacity: next });
    },
    [instance],
  );

  const changeColor = React.useCallback(
    (value: string) => {
      if (!instance || !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value.trim())) {
        return;
      }
      const next = toStrokeColor(value);
      setColor(next);
      usePens.getState().setInk(toInk(next));
      instance.updatePropsAction(BRUSH_TOOL, { stroke: next });
    },
    [instance],
  );

  const inkOf = React.useCallback(
    (id: string) => inkFor({ ink, inks }, id),
    [ink, inks],
  );

  return {
    active,
    eraserActive,
    pens: PENS,
    pen,
    size,
    opacity,
    color,
    eraserSize,
    inkOf,
    selectPen,
    selectEraser,
    changeSize,
    changeOpacity,
    changeColor,
  };
}
