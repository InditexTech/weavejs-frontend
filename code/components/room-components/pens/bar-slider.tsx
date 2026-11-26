// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";

const KNOB = 16;

type BarSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  /** Above 1 the low end gets finer steps, where small strokes live. */
  curve?: number;
  display: string;
  /** Colour of the filled part. */
  color: string;
  /** A chequerboard behind the fill, so a low value reads as see-through. */
  checker?: boolean;
  className?: string;
  onChange: (value: number) => void;
};

/** A slider with its name and value above the track. */
export function BarSlider({
  label,
  value,
  min,
  max,
  curve = 1,
  display,
  color,
  checker,
  className,
  onChange,
}: Readonly<BarSliderProps>) {
  const track = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const valueAt = (clientX: number) => {
    const rect = track.current!.getBoundingClientRect();
    const usable = Math.max(1, rect.width - KNOB);
    const t = Math.min(
      1,
      Math.max(0, (clientX - rect.left - KNOB / 2) / usable),
    );
    return min + (max - min) * Math.pow(t, curve);
  };

  const pct = Math.pow(
    Math.min(1, Math.max(0, (value - min) / (max - min))),
    1 / curve,
  );
  const at = `calc(${KNOB / 2}px + ${pct} * (100% - ${KNOB}px))`;
  const step = (max - min) / 50;

  return (
    <div className={cn("flex w-[148px] flex-none flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between text-[12px] font-inter">
        <span className="font-light text-[#757575]">{label}</span>
        <span className="tabular-nums text-black">{display}</span>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        className="group relative flex h-[16px] cursor-pointer touch-none items-center outline-none"
        onPointerDown={(e) => {
          e.preventDefault();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // not every environment can capture the pointer
          }
          dragging.current = true;
          onChange(valueAt(e.clientX));
        }}
        onPointerMove={(e) => {
          if (dragging.current) onChange(valueAt(e.clientX));
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(max, value + step));
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(min, value - step));
          }
        }}
      >
        <span className="pointer-events-none absolute inset-x-0 inset-y-[2px] overflow-hidden bg-[#e8e8e8]">
          {checker && (
            <span
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "conic-gradient(#d4d4d4 25%, #fff 0 50%, #d4d4d4 0 75%, #fff 0)",
                backgroundSize: "8px 8px",
              }}
            />
          )}
          <span
            className="absolute inset-y-0 left-0"
            style={{ width: at, background: color }}
          />
        </span>
        <span
          className="pointer-events-none absolute top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_1px_4px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110"
          style={{ left: at }}
        />
      </div>
    </div>
  );
}
