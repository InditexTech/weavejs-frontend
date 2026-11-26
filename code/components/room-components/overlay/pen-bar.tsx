// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ChevronLeft, Minimize2 } from "lucide-react";
import { MorphBar } from "../pens/morph-bar";
import { BarSlider } from "../pens/bar-slider";
import { ColourChips } from "../pens/colour-chips";
import { PenArt } from "../pens/pen-art";
import { PenButton } from "../pens/pen-button";
import { usePenControls, usePenMemorySync } from "../pens/use-pen-controls";
import { cn } from "@/lib/utils";
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
import { usePens } from "@/store/pens";

/** Space kept between the bar and the footer. */
export const PEN_BAR_MARGIN = 8;

type PenBarProps = {
  className?: string;
  enabled?: boolean;
  /** Height of a footer the overlay layer runs underneath (0 when it stops above it). */
  footerHeight?: number;
  /** Space on each side the bar must stay clear of, such as an open sidebar. */
  insetLeft?: number;
  insetRight?: number;
};

const roundButton =
  "flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-none border-0 bg-transparent text-black hover:bg-[#f0f0f0]";

function Divider() {
  return <span className="mx-2 h-[24px] w-px shrink-0 bg-zinc-200" />;
}

export function PenBar({
  className,
  enabled = PENS_AND_ERASER_ENABLED,
  footerHeight = 0,
  insetLeft = 0,
  insetRight = 0,
}: Readonly<PenBarProps>) {
  usePenMemorySync(enabled);
  const controls = usePenControls(enabled);
  const { eraserActive } = controls;

  const storedPanel = usePens((s) => s.panel);
  const collapsed = usePens((s) => s.collapsed);
  const setPanel = usePens((s) => s.setPanel);
  const setCollapsed = usePens((s) => s.setCollapsed);

  // Whenever the bar opens (the brush chosen again, for instance) it starts on the pens.
  const open = controls.active;
  React.useEffect(() => {
    if (open) setPanel("tools");
  }, [open, setPanel]);

  if (!controls.active) {
    return null;
  }

  // The eraser has no colour to pick.
  const panel = eraserActive && storedPanel === "ink" ? "tools" : storedPanel;
  const ink = toInk(controls.color);
  const eraserInk = "#c9c7c2";
  const size = eraserActive ? controls.eraserSize : controls.size;
  const sizeMax = eraserActive ? STROKE_ERASER_MAX_SIZE : BRUSH_MAX_SIZE;
  const dot = 6 + (size / sizeMax) * 16;

  const back = (
    <>
      <button
        type="button"
        aria-label="Back to tools"
        title="Back"
        className={roundButton}
        onClick={() => setPanel("tools")}
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <Divider />
    </>
  );

  const tools = (
    <div className="flex h-full items-center pl-3 pr-2">
      <div className="flex h-full items-end gap-[2px]">
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
      <Divider />
      <button
        type="button"
        aria-label="Size and opacity"
        title={eraserActive ? "Size" : "Size and opacity"}
        className={roundButton}
        onClick={() => setPanel("size")}
      >
        <span
          className="rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.22)] transition-[width,height,background-color,opacity] duration-200"
          style={{
            width: dot,
            height: dot,
            background: eraserActive ? eraserInk : ink,
            opacity: eraserActive ? 1 : controls.opacity,
          }}
        />
      </button>
      {!eraserActive && (
        <button
          type="button"
          aria-label="Colour"
          title="Colour"
          className={roundButton}
          onClick={() => setPanel("ink")}
        >
          <span
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full shadow-[0_0_0_0.5px_rgba(0,0,0,0.12)]"
            style={{
              backgroundImage:
                "conic-gradient(#ff383c, #ff8d28, #ffcc00, #34c759, #00c3d0, #0088ff, #6155f5, #d6336c, #ff383c)",
            }}
          >
            <span
              className="h-[13px] w-[13px] rounded-full shadow-[0_0_0_3px_#fff] transition-[background-color] duration-200"
              style={{ background: ink }}
            />
          </span>
        </button>
      )}
      <Divider />
      <button
        type="button"
        aria-label="Hide tools"
        title="Hide tools"
        className={roundButton}
        onClick={() => setCollapsed(true)}
      >
        <Minimize2 size={18} strokeWidth={1.5} />
      </button>
    </div>
  );

  const colours = (
    <div className="flex h-full items-center px-3">
      {back}
      <ColourChips
        color={controls.color}
        onPick={controls.changeColor}
        className="flex-nowrap"
      />
    </div>
  );

  const sizes = (
    <div className="flex h-full items-center px-3">
      {back}
      <BarSlider
        label="Size"
        value={size}
        min={eraserActive ? STROKE_ERASER_MIN_SIZE : BRUSH_MIN_SIZE}
        max={sizeMax}
        curve={2}
        display={String(Math.round(size))}
        color={eraserActive ? eraserInk : ink}
        onChange={controls.changeSize}
      />
      {!eraserActive && (
        <>
          <Divider />
          <BarSlider
            label="Opacity"
            value={controls.opacity}
            min={MIN_OPACITY}
            max={1}
            display={`${Math.round(controls.opacity * 100)}%`}
            color={ink}
            checker
            onChange={controls.changeOpacity}
          />
        </>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-10 flex justify-center",
        className,
      )}
      style={{
        left: insetLeft,
        right: insetRight,
        bottom: footerHeight + PEN_BAR_MARGIN,
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && panel !== "tools") {
          e.stopPropagation();
          setPanel("tools");
        }
      }}
    >
      <div role="toolbar" aria-label="Pen bar">
        <MorphBar
          active={panel}
          collapsed={collapsed}
          onExpand={() => setCollapsed(false)}
          panels={[
            { id: "tools", content: tools },
            { id: "ink", content: colours },
            { id: "size", content: sizes },
          ]}
          collapsedContent={
            <PenArt
              id={eraserActive ? "eraser" : (controls.pen ?? "pen")}
              ink={eraserActive ? eraserInk : ink}
              className="mt-[10px] h-[84px] w-[28px]"
            />
          }
        />
      </div>
    </div>
  );
}
