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
  /** Dim the pens that are not chosen. Off while no pen has been chosen yet. */
  dimIdle?: boolean;
  /** Background of the slot behind the chosen pen. */
  slotClassName?: string;
  title?: string;
  className?: string;
};

// The barrel fades out toward the bottom of the slot, whatever the pen's lift.
const FADE =
  "linear-gradient(to bottom, #000 0, #000 80%, rgba(0,0,0,0.1) 100%)";

/**
 * A pen standing in its tray. The chosen one is lifted out, has a slot behind
 * it and an underline; the others sit low.
 */
export function PenButton({
  id,
  label,
  ink,
  active,
  onClick,
  dimIdle = true,
  slotClassName = "bg-[#f1f1ef]",
  title,
  className,
}: Readonly<PenButtonProps>) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      aria-pressed={active}
      data-active={active || undefined}
      className={cn(
        "group relative h-[72px] w-[36px] shrink-0 cursor-pointer overflow-visible rounded-none border-0 bg-transparent p-0",
        className,
      )}
      onClick={onClick}
    >
      {active && (
        <span
          aria-hidden="true"
          data-slot
          className={cn(
            "pointer-events-none absolute inset-y-0 -inset-x-px",
            slotClassName,
          )}
        />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ WebkitMaskImage: FADE, maskImage: FADE }}
      >
        <PenArt
          id={id}
          ink={ink}
          className={cn(
            "absolute left-[2px] top-0 h-[96px] w-[32px] transition-[transform,filter,opacity] duration-[380ms] ease-out",
            active
              ? "-translate-y-[6px] drop-shadow-[0_3px_4px_rgba(0,0,0,0.22)]"
              : "translate-y-[12px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.14)] group-hover:translate-y-[6px] group-hover:opacity-100",
            !active && dimIdle && "opacity-80",
          )}
        />
      </span>
      {active && (
        <span
          aria-hidden="true"
          data-underline
          className="pointer-events-none absolute inset-x-1 bottom-0 h-[3px] bg-[#2e2e2e]"
        />
      )}
    </button>
  );
}
