// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { cn } from "@/lib/utils";

type DividerSize = "normal" | "small";
type DividerColor = "normal" | "black";

type DividerProps = {
  className?: string;
  size?: DividerSize;
  color?: DividerColor;
};

export function Divider({
  className,
  size = "normal",
  color = "normal",
}: Readonly<DividerProps>) {
  return (
    <div
      className={cn(
        "bg-[#c9c9c9] w-[1px]",
        {
          ["h-[32px]"]: size === "normal",
          ["h-[16px]"]: size === "small",
        },
        {
          ["bg-[#c9c9c9]"]: color === "normal",
          ["bg-black"]: color === "black",
        },
        className
      )}
    ></div>
  );
}
