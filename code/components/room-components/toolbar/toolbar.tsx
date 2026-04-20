// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { cn } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";
import React from "react";

type ToolbarProps = {
  className?: string;
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
};

export const Toolbar = ({
  className,
  children,
  orientation = "vertical",
}: Readonly<ToolbarProps>) => {
  const selectionActive = useWeave((state) => state.selection.active);

  return (
    <div
      className={cn(
        "gap-[4px] p-[4px] bg-white border-[0.5px] rounded-none !border-0",
        {
          ["pointer-events-none"]: selectionActive,
          ["pointer-events-auto"]: !selectionActive,
          ["flex flex-row"]: orientation === "horizontal",
          ["flex flex-col justify-center items-center"]:
            orientation === "vertical",
        },
        className,
      )}
    >
      {children}
    </div>
  );
};
