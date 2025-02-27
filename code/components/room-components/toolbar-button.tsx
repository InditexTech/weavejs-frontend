"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ToolbarButtonProps = {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

export const ToolbarButton = ({ icon, onClick, disabled = false, active = false }: Readonly<ToolbarButtonProps>) => {
  return (
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
  );
};
