// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveStateElement } from "@inditextech/weave-types";
import {
  DEFAULT_STICKY_NOTE_COLOR,
  STICKY_NOTE_LABEL_DEFAULTS,
  STICKY_NOTE_PASTEL_COLORS,
} from "@inditextech/weave-sdk";
import { cn } from "@/lib/utils";
import { InputNumber } from "../inputs/input-number";
import { useNodePropertiesTarget } from "../hooks/use-node-properties-target";

export function StickyNoteProperties() {
  const {
    instance,
    actualAction,
    nodePropertiesAction,
    actualNode,
    updateElement,
  } = useNodePropertiesTarget();

  const updateProp = (props: Record<string, unknown>) => {
    if (!actualNode) return;
    updateElement({
      ...actualNode,
      props: { ...actualNode.props, ...props },
    } as WeaveStateElement);
  };

  if (!instance || !actualNode || !nodePropertiesAction) {
    return null;
  }

  if (
    actualAction === "selectionTool" &&
    !["sticky-note"].includes(actualNode.type)
  ) {
    return null;
  }

  if (
    actualAction &&
    !["selectionTool", "stickyNoteTool"].includes(actualAction)
  ) {
    return null;
  }

  const currentColor = actualNode.props.color ?? DEFAULT_STICKY_NOTE_COLOR;

  return (
    <div className="p-[24px] pt-[16px] pb-0 flex flex-col gap-[16px]">
      <div className="w-full flex flex-col gap-3">
        <span className="text-[13px] font-inter font-light uppercase">
          Note color
        </span>
        <div className="grid grid-cols-8 gap-2 w-full">
          {STICKY_NOTE_PASTEL_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Note color ${color}`}
              className={cn(
                "h-[24px] w-full cursor-pointer border border-[#c9c9c9]",
                {
                  ["ring-1 ring-black ring-offset-1"]:
                    currentColor.toLowerCase() === color.toLowerCase(),
                },
              )}
              style={{ backgroundColor: color }}
              onClick={() => updateProp({ color })}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        <InputNumber
          label="Padding X (px)"
          min={0}
          max={100}
          value={
            actualNode.props.labelPaddingX ??
            STICKY_NOTE_LABEL_DEFAULTS.labelPaddingX
          }
          onChange={(value) => updateProp({ labelPaddingX: value })}
        />
        <InputNumber
          label="Padding Y (px)"
          min={0}
          max={100}
          value={
            actualNode.props.labelPaddingY ??
            STICKY_NOTE_LABEL_DEFAULTS.labelPaddingY
          }
          onChange={(value) => updateProp({ labelPaddingY: value })}
        />
      </div>
    </div>
  );
}
