// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { cn } from "@/lib/utils";
import React from "react";

type ToolbarDividerProps = {
  orientation?: "vertical" | "horizontal";
};

export function ToolbarDivider({
  orientation = "vertical",
}: Readonly<ToolbarDividerProps>) {
  return (
    <div className="w-full justify-center items-center flex">
      <div
        className={cn("bg-zinc-200", {
          "w-[1px] h-[20px] mx-2": orientation === "vertical",
          "w-[20px] h-[1px] my-2": orientation === "horizontal",
        })}
      ></div>
    </div>
  );
}
