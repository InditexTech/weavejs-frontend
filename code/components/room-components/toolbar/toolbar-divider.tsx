// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { cn } from "@/lib/utils";
import React from "react";

type ToolbarDividerProps = {
  className?: string;
  orientation?: "vertical" | "horizontal";
};

export function ToolbarDivider({
  className,
  orientation = "vertical",
}: Readonly<ToolbarDividerProps>) {
  return (
    <div className={cn("w-full justify-center items-center flex", className)}>
      <div
        className={cn("bg-zinc-200", {
          "w-[1px] h-[calc(100%-16px)] mx-2": orientation === "vertical",
          "w-[calc(100%-16px)] h-[1px] my-2": orientation === "horizontal",
        })}
      ></div>
    </div>
  );
}
