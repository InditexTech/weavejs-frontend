// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";

export const BAR_HEIGHT = 72;
export const TILE_SIZE = 56;

export type MorphPanel = { id: string; content: React.ReactNode };

type MorphBarProps = {
  panels: MorphPanel[];
  active: string;
  collapsed: boolean;
  collapsedContent: React.ReactNode;
  onExpand: () => void;
  className?: string;
};

/**
 * One bar that changes shape instead of changing places. Every panel stays
 * mounted; the bar's width follows the measured width of the one that is
 * shown, and the others fade out and cannot be reached.
 */
export function MorphBar({
  panels,
  active,
  collapsed,
  collapsedContent,
  onExpand,
  className,
}: Readonly<MorphBarProps>) {
  const refs = React.useRef(new Map<string, HTMLDivElement>());
  const [extent, setExtent] = React.useState<number | null>(null);
  const canMeasure = typeof ResizeObserver !== "undefined";

  React.useLayoutEffect(() => {
    const el = refs.current.get(active);
    if (!el) return;
    const measure = () => {
      if (el.scrollWidth > 0) setExtent(el.scrollWidth);
    };
    measure();
    if (!canMeasure) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, canMeasure]);

  const hidden = canMeasure && extent === null;

  return (
    <div
      className={cn(
        "pointer-events-auto relative overflow-hidden rounded-none bg-white drop-shadow transition-[width,height] duration-300 ease-out",
        className,
      )}
      style={{
        width: collapsed ? TILE_SIZE : (extent ?? undefined),
        height: collapsed ? TILE_SIZE : BAR_HEIGHT,
        visibility: hidden ? "hidden" : undefined,
      }}
    >
      {panels.map((panel) => {
        const shown = panel.id === active && !collapsed;
        return (
          <div
            key={panel.id}
            ref={(el) => {
              if (el) refs.current.set(panel.id, el);
              else refs.current.delete(panel.id);
            }}
            data-panel={panel.id}
            data-active={shown || undefined}
            aria-hidden={shown ? undefined : true}
            {...(shown ? {} : ({ inert: "" } as object))}
            className={cn(
              "absolute inset-y-0 left-0 flex w-max items-center transition-[opacity,filter,transform] duration-300 ease-out",
              shown
                ? "scale-100 opacity-100 blur-0"
                : "pointer-events-none scale-95 opacity-0 blur-[6px]",
            )}
          >
            {panel.content}
          </div>
        );
      })}
      <div
        data-tile
        aria-hidden={collapsed ? undefined : true}
        className={cn(
          "pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden transition-opacity duration-200",
          collapsed ? "opacity-100" : "opacity-0",
        )}
      >
        {collapsedContent}
      </div>
      {collapsed && (
        <button
          type="button"
          aria-label="Show drawing tools"
          title="Show drawing tools"
          className="absolute inset-0 cursor-pointer rounded-none border-0 bg-transparent hover:bg-black/5"
          onClick={onExpand}
        />
      )}
    </div>
  );
}
