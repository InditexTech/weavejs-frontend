// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Check } from "lucide-react";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarButton } from "../toolbar/toolbar-button";

const LONG_PRESS_MS = 350;
const STORAGE_PREFIX = "weave.toolbar.group.";

export type ToolGroupItem = {
  id: string;
  name: string;
  section?: string;
  shortcut?: string;
  icon: React.JSX.Element;
  label: React.ReactNode;
  onClick: () => void;
  active: () => boolean;
  hidden?: boolean;
};

type ToolGroupProps = {
  id: string;
  items: ToolGroupItem[];
  orientation: "horizontal" | "vertical";
  disabled?: boolean;
  openGroup: string | null;
  onOpenGroupChange: (groupId: string | null) => void;
  /** Tool shown in the main button when nothing was chosen yet. */
  defaultItemId?: string;
  /**
   * When true the last chosen tool stays in the main button (and is stored in
   * localStorage). When false the main button shows `fallbackIcon` unless one
   * of the tools of the group is active.
   */
  rememberLast?: boolean;
  fallbackIcon?: React.JSX.Element;
  fallbackLabel?: React.ReactNode;
};

function readStoredItem(groupId: string, items: ToolGroupItem[]) {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(STORAGE_PREFIX + groupId);
    return items.some((item) => item.id === stored)
      ? (stored as string)
      : undefined;
  } catch {
    return undefined;
  }
}

export function ToolGroup({
  id,
  items,
  orientation,
  disabled = false,
  openGroup,
  onOpenGroupChange,
  defaultItemId,
  rememberLast = true,
  fallbackIcon,
  fallbackLabel,
}: Readonly<ToolGroupProps>) {
  const visibleItems = React.useMemo(
    () => items.filter((item) => !item.hidden),
    [items],
  );

  const [selectedId, setSelectedId] = React.useState<string | undefined>(() =>
    rememberLast ? readStoredItem(id, visibleItems) : undefined,
  );

  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const longPressed = React.useRef(false);

  const open = openGroup === id;

  const activeItem = visibleItems.find((item) => item.active());
  const rememberedItem = rememberLast
    ? visibleItems.find((item) => item.id === (selectedId ?? defaultItemId))
    : undefined;
  const mainItem = activeItem ?? rememberedItem;

  const clearLongPress = React.useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  React.useEffect(() => clearLongPress, [clearLongPress]);

  const selectItem = React.useCallback(
    (item: ToolGroupItem) => {
      onOpenGroupChange(null);
      if (rememberLast) {
        setSelectedId(item.id);
        try {
          window.localStorage.setItem(STORAGE_PREFIX + id, item.id);
        } catch {
          // storage unavailable, the choice just lasts for this session
        }
      }
      item.onClick();
    },
    [id, onOpenGroupChange, rememberLast],
  );

  const sections = React.useMemo(() => {
    const result: { name?: string; items: ToolGroupItem[] }[] = [];
    for (const item of visibleItems) {
      const last = result[result.length - 1];
      if (last && last.name === item.section) {
        last.items.push(item);
      } else {
        result.push({ name: item.section, items: [item] });
      }
    }
    return result;
  }, [visibleItems]);

  const tooltipSide = orientation === "horizontal" ? "top" : "right";

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <DropdownMenu
      modal={false}
      open={open}
      onOpenChange={(next) => onOpenGroupChange(next ? id : null)}
    >
      <div
        className="relative h-[40px] w-[40px] shrink-0"
        onPointerDown={(e) => {
          if (disabled || e.button !== 0) return;
          longPressed.current = false;
          clearLongPress();
          longPressTimer.current = setTimeout(() => {
            longPressed.current = true;
            onOpenGroupChange(id);
          }, LONG_PRESS_MS);
        }}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}
        onPointerCancel={clearLongPress}
        onClickCapture={(e) => {
          if (longPressed.current) {
            longPressed.current = false;
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!disabled) onOpenGroupChange(id);
        }}
      >
        <ToolbarButton
          className="rounded-none !w-[40px]"
          icon={mainItem?.icon ?? (fallbackIcon as React.JSX.Element)}
          disabled={disabled}
          active={mainItem ? mainItem.active() : false}
          onClick={() => {
            if (mainItem) {
              mainItem.onClick();
              return;
            }
            onOpenGroupChange(open ? null : id);
          }}
          label={mainItem?.label ?? fallbackLabel}
          tooltipSide={tooltipSide}
          tooltipAlign="center"
          size="medium"
        />
        <DropdownMenuTrigger
          disabled={disabled}
          aria-label="More tools in this group"
          title="More tools"
          className={cn(
            "absolute bottom-0 right-0 z-10 flex h-[16px] w-[16px] items-end justify-end p-[3px] focus:outline-none",
            {
              ["cursor-pointer"]: !disabled,
              ["opacity-50"]: disabled,
              ["text-white/70 hover:text-white"]: !!mainItem?.active(),
              ["text-[#8a8a8a] hover:text-black"]: !mainItem?.active(),
            },
          )}
        >
          <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true">
            <path d="M6 0 L6 6 L0 6 Z" fill="currentColor" />
          </svg>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
        align="start"
        side={tooltipSide}
        alignOffset={orientation === "vertical" ? -26 : 0}
        sideOffset={12}
        className="font-inter min-w-[220px] rounded-none border-[#c9c9c9] p-1 shadow-sm"
      >
        {sections.map((section, sectionIndex) => (
          <React.Fragment key={section.name ?? `section-${sectionIndex}`}>
            {sectionIndex > 0 && <DropdownMenuSeparator />}
            {section.name && (
              <DropdownMenuLabel className="font-light text-xs text-[#757575]">
                {section.name}
              </DropdownMenuLabel>
            )}
            {section.items.map((item) => {
              const isActive = item.active();
              return (
                <DropdownMenuItem
                  key={item.id}
                  className={cn(
                    "text-xs cursor-pointer rounded-none w-full gap-3 px-2 py-2",
                    { ["bg-[#f0f0f0]"]: isActive },
                  )}
                  onSelect={() => selectItem(item)}
                >
                  {React.cloneElement(item.icon, {
                    size: 20,
                    className: "shrink-0",
                  } as React.Attributes)}
                  <span className="flex-1">{item.name}</span>
                  {item.shortcut && (
                    <span className="text-[11px] text-[#757575]">
                      {formatForDisplay(item.shortcut)}
                    </span>
                  )}
                  <span className="w-[14px] flex justify-center">
                    {isActive && <Check size={14} strokeWidth={1.5} />}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
