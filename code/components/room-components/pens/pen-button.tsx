// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";
import { PenArt } from "./pen-art";

type PenButtonProps = {
  id: string;
  label: string;
  ink: string;
  active: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
};

/** A pen standing in its tray: the chosen one is lifted out, the rest sit low. */
export function PenButton({
  id,
  label,
  ink,
  active,
  onClick,
  title,
  className,
}: Readonly<PenButtonProps>) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "group relative h-[72px] w-[34px] shrink-0 cursor-pointer overflow-visible rounded-none border-0 bg-transparent p-0",
        className,
      )}
      onClick={onClick}
    >
      <PenArt
        id={id}
        ink={ink}
        className={cn(
          "absolute left-0 top-0 h-[102px] w-[34px] transition-[transform,filter] duration-[380ms] ease-out",
          active
            ? "-translate-y-[4px] drop-shadow-[0_4px_5px_rgba(0,0,0,0.22)]"
            : "translate-y-[8px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.14)] group-hover:translate-y-[3px]",
        )}
      />
    </button>
  );
}
