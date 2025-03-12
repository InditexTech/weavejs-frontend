"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ToolbarButtonProps = {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
};

export function ToolbarButton({
  icon,
  label = "tool",
  onClick,
  disabled = false,
  active = false,
  tooltipSide = "right",
}: Readonly<ToolbarButtonProps>) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "pointer-events-auto cursor-pointer hover:text-black hover:bg-accent px-2 py-2 flex justify-center items-center",
              {
                ["bg-zinc-700 text-white"]: active,
                ["pointer-events-none cursor-default text-black opacity-50"]:
                  disabled,
              }
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
  );
}
