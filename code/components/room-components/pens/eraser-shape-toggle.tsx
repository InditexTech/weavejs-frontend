// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Circle, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ERASER_SHAPES,
  ERASER_SHAPE_LABELS,
  type EraserShape,
} from "@/lib/pens-eraser/shape";

const ICONS = { circle: Circle, square: Square } as const;

type EraserShapeToggleProps = {
  shape: EraserShape;
  onChange: (shape: EraserShape) => void;
  /** `bar`: icons only, like the toolbar buttons. `labelled`: icon and name. */
  variant?: "bar" | "labelled";
  className?: string;
};

/** The two shapes the stroke eraser can have, as a pressed/not pressed pair. */
export function EraserShapeToggle({
  shape,
  onChange,
  variant = "bar",
  className,
}: Readonly<EraserShapeToggleProps>) {
  return (
    <fieldset
      aria-label="Eraser shape"
      className={cn("m-0 flex min-w-0 items-center border-0 p-0", className)}
    >
      {ERASER_SHAPES.map((option) => {
        const Icon = ICONS[option];
        const label = `${ERASER_SHAPE_LABELS[option]} eraser`;
        const active = shape === option;
        return (
          <button
            key={option}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={cn(
              "flex h-[40px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-none border-0 text-black hover:bg-[#f0f0f0]",
              variant === "bar"
                ? "w-[40px]"
                : "flex-1 border border-[#c9c9c9] px-3 text-[13px] font-inter font-light",
              active
                ? "bg-[#2e2e2e] text-white hover:bg-[#2e2e2e]"
                : "bg-transparent",
            )}
            onClick={() => onChange(option)}
          >
            <Icon size={variant === "bar" ? 20 : 16} strokeWidth={1.5} />
            {variant === "labelled" && ERASER_SHAPE_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}
