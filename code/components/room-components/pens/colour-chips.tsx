// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPickerInput } from "../inputs/color-picker";
import { PEN_BAR_COLORS, toInk } from "@/lib/pens-eraser/pen-bar";

type ColourChipsProps = {
  /** The current colour, `#rrggbbaa`. */
  color: string;
  onPick: (color: string) => void;
  className?: string;
};

function isLight(hex: string): boolean {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

/** The palette, with a rainbow chip that opens the colour picker. */
export function ColourChips({
  color,
  onPick,
  className,
}: Readonly<ColourChipsProps>) {
  const current = toInk(color);

  return (
    <div className={cn("flex flex-wrap items-center gap-[6px]", className)}>
      {PEN_BAR_COLORS.map((swatch) => {
        const active = current === swatch;
        return (
          <button
            key={swatch}
            type="button"
            title={swatch}
            aria-label={`Color ${swatch}`}
            aria-pressed={active}
            data-active={active || undefined}
            className={cn(
              "relative flex h-[28px] w-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] border-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14)] transition-transform hover:scale-110",
              active &&
                "scale-110 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14),0_3px_8px_rgba(0,0,0,0.24)]",
            )}
            style={{ background: swatch }}
            onClick={() => onPick(swatch)}
          >
            {active && (
              <Check
                size={16}
                strokeWidth={2.6}
                color={isLight(swatch) ? "#111" : "#fff"}
              />
            )}
          </button>
        );
      })}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Any colour"
            aria-label="Any colour"
            className="relative h-[28px] w-[28px] shrink-0 cursor-pointer overflow-hidden rounded-[6px] border-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14)] transition-transform hover:scale-110"
          >
            <span
              className="absolute inset-0 rounded-[6px] shadow-[inset_0_0_0_4px_#fff]"
              style={{
                backgroundImage:
                  "conic-gradient(#ff383c, #ffcc00, #34c759, #0088ff, #6155f5, #ff383c)",
              }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="w-[300px] rounded-none border-[#c9c9c9]"
        >
          <ColorPickerInput value={color} onChange={onPick} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
