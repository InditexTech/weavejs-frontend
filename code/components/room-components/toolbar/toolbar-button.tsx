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
import { useIsTouchDevice } from "../hooks/use-is-touch-device";

type ToolbarButtonProps = {
  className?: string;
  variant?: "rounded" | "squared";
  icon: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (e: any) => void;
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

    const isTouchDevice = useIsTouchDevice();

    const bind = useLongPress(
      () => {
        alert("Long pressed!");
      },
      {
        detect: "pointer" as LongPressEventType,
      }
    );

    const ButtonElement = React.useMemo(() => {
      return (
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
          onMouseOver={(e) => e.preventDefault()}
          onClick={(e) => onClick(e)}
          {...bind()}
        >
          {icon}
        </button>
      );
    }, [
      forwardedRef,
      variant,
      active,
      disabled,
      className,
      icon,
      onClick,
      bind,
      selectionActive,
    ]);

    if (isTouchDevice) {
      return ButtonElement;
    }

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{ButtonElement}</TooltipTrigger>
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
