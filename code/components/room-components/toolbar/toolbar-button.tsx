// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { LongPressEventType, useLongPress } from "use-long-press";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWeave } from "@inditextech/weave-react";

type ToolbarButtonProps = {
  className?: string;
  variant?: "rounded" | "squared";
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  tooltipSideOffset?: number;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  tooltipAlign?: "start" | "center" | "end";
};

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(
  (
    {
      className,
      icon,
      variant = "rounded",
      label = "tool",
      onClick,
      disabled = false,
      active = false,
      tooltipSideOffset = 8,
      tooltipSide = "right",
      tooltipAlign = "center",
    },
    forwardedRef
  ) => {
    const selectionActive = useWeave((state) => state.selection.active);

    const bind = useLongPress(
      () => {
        alert("Long pressed!");
      },
      {
        detect: "pointer" as LongPressEventType,
      }
    );

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={forwardedRef}
              className={cn(
                "!pointer-events-none relative cursor-pointer h-[40px] flex justify-center items-center",
                {
                  ["hover:bg-[#f0f0f0]"]: variant === "rounded",
                  ["hover:text-[#666666]"]: variant === "squared",
                  ["!pointer-events-auto"]: !selectionActive,
                  ["!pointer-events-none"]: selectionActive,
                  ["bg-[#2e2e2e] text-white hover:text-[#666666]"]: active,
                  ["pointer-events-none cursor-default text-black opacity-50"]:
                    disabled,
                },
                className
              )}
              disabled={disabled}
              onClick={onClick}
              {...bind()}
            >
              {icon}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side={tooltipSide}
            align={tooltipAlign}
            sideOffset={tooltipSideOffset}
            className="rounded-none"
          >
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

ToolbarButton.displayName = "ToolbarButton";
