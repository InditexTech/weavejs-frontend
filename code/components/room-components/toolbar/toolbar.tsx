// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { cn } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";
import React from "react";

type ToolbarProps = {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
};

export const Toolbar = ({
  children,
  orientation = "vertical",
}: Readonly<ToolbarProps>) => {
  const selectionActive = useWeave((state) => state.selection.active);

  return (
    <div
      className={cn(
        "gap-[4px] p-[4px] bg-white border rounded-full border-[#c9c9c9]",
        {
          ["pointer-events-none"]: selectionActive,
          ["pointer-events-auto"]: !selectionActive,
          ["flex"]: orientation === "horizontal",
          ["flex flex-col"]: orientation === "vertical",
        }
      )}
    >
      {children}
    </div>
  );
};
