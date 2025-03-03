"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

type ToolbarButtonProps = {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
};

export function ToolbarButton({ icon, label = "tool", onClick, disabled = false, active = false, tooltipSide = "right" }: Readonly<ToolbarButtonProps>) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
        <button
            className={cn(
              "pointer-events-auto cursor-pointer rounded bg-light-background-1 hover:bg-light-background-2 disabled:cursor-default disabled:bg-light-background-disabled disabled:text-light-content-disabled px-3 py-3 flex justify-center items-center",
              {
                ["bg-light-background-active"]: active,
              },
            )}
            disabled={disabled}
            onClick={onClick}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};