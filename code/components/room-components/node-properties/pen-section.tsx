// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { BarSlider } from "../pens/bar-slider";
import { ColourChips } from "../pens/colour-chips";
import { PenButton } from "../pens/pen-button";
import { usePenControls } from "../pens/use-pen-controls";
import { PENS_AND_ERASER_ENABLED } from "@/lib/pens-eraser/flag";
import {
  BRUSH_MAX_SIZE,
  BRUSH_MIN_SIZE,
  MIN_OPACITY,
  toInk,
} from "@/lib/pens-eraser/pen-bar";
import { STROKE_ERASER_LABEL } from "@/lib/pens-eraser/tool";
import { STROKE_ERASER_SHORTCUT_LABEL } from "@/lib/pens-eraser/shortcut";
import {
  STROKE_ERASER_MAX_SIZE,
  STROKE_ERASER_MIN_SIZE,
} from "@/lib/pens-eraser/size";

type PenSectionProps = {
  enabled?: boolean;
};

/** The pen bar's pens, colours and sliders, for the brush tool's properties panel. */
export function PenSection({
  enabled = PENS_AND_ERASER_ENABLED,
}: Readonly<PenSectionProps>) {
  const controls = usePenControls(enabled);

  if (!controls.active) {
    return null;
  }

  const { eraserActive } = controls;
  const ink = toInk(controls.color);
  const eraserInk = "#c9c7c2";
  const current = controls.pens.find((p) => p.id === controls.pen);
  const size = eraserActive ? controls.eraserSize : controls.size;

  return (
    <div className="col-span-2 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="font-inter text-[12px] font-light text-[#757575]">
          Pen
          {eraserActive
            ? ` · ${STROKE_ERASER_LABEL}`
            : current
              ? ` · ${current.label}`
              : ""}
        </div>
        <div
          role="group"
          aria-label="Pens"
          className="flex h-[72px] items-end justify-center gap-[2px] overflow-hidden border border-[#c9c9c9] bg-[#f5f5f5] px-2"
        >
          {controls.pens.map((pen) => (
            <PenButton
              key={pen.id}
              id={pen.id}
              label={pen.label}
              ink={controls.inkOf(pen.id)}
              active={!eraserActive && controls.pen === pen.id}
              onClick={() => controls.selectPen(pen.id)}
            />
          ))}
          <PenButton
            id="eraser"
            label={STROKE_ERASER_LABEL}
            title={`${STROKE_ERASER_LABEL} (${STROKE_ERASER_SHORTCUT_LABEL})`}
            ink={eraserInk}
            active={eraserActive}
            onClick={controls.selectEraser}
          />
        </div>
      </div>
      {!eraserActive && (
        <div className="flex flex-col gap-1">
          <div className="font-inter text-[12px] font-light text-[#757575]">
            Color
          </div>
          <ColourChips color={controls.color} onPick={controls.changeColor} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <BarSlider
          className="w-full"
          label="Size"
          value={size}
          min={eraserActive ? STROKE_ERASER_MIN_SIZE : BRUSH_MIN_SIZE}
          max={eraserActive ? STROKE_ERASER_MAX_SIZE : BRUSH_MAX_SIZE}
          curve={2}
          display={String(Math.round(size))}
          color={eraserActive ? eraserInk : ink}
          onChange={controls.changeSize}
        />
        {!eraserActive && (
          <BarSlider
            className="w-full"
            label="Opacity"
            value={controls.opacity}
            min={MIN_OPACITY}
            max={1}
            display={`${Math.round(controls.opacity * 100)}%`}
            color={ink}
            checker
            onChange={controls.changeOpacity}
          />
        )}
      </div>
    </div>
  );
}
