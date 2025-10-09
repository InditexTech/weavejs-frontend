// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn, SYSTEM_OS } from "@/lib/utils";
import {
  SwatchBook,
  ListTree,
  Projector,
  Images,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";

type SidebarSelectorProps = {
  title: string;
};

export const SidebarSelector = ({ title }: Readonly<SidebarSelectorProps>) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
  );

  return (
    <DropdownMenu onOpenChange={(open: boolean) => setMenuOpen(open)}>
      <DropdownMenuTrigger
        className={cn(
          "flex gap-2 rounded-none h-[40px] font-inter font-light text-[24px] hover:text-[#c9c9c9] justify-start items-center uppercase cursor-pointer focus:outline-none",
          {
            ["font-light text-[#c9c9c9]"]: menuOpen,
            ["font-light"]: !menuOpen,
          }
        )}
      >
        <span>{title}</span>
        {menuOpen ? (
          <ChevronUp size={20} strokeWidth={1} />
        ) : (
          <ChevronDown size={20} strokeWidth={1} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        alignOffset={0}
        sideOffset={9}
        className="font-inter rounded-none"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={() => {
              sidebarToggle(SIDEBAR_ELEMENTS.images);
            }}
          >
            <Images strokeWidth={1} /> Images
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ I" : "Alt Ctrl I"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={() => {
              sidebarToggle(SIDEBAR_ELEMENTS.videos);
            }}
          >
            <Images strokeWidth={1} /> Videos
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ V" : "Alt Ctrl V"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={() => {
              sidebarToggle(SIDEBAR_ELEMENTS.frames);
            }}
          >
            <Projector strokeWidth={1} /> Frames
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ F" : "Alt Ctrl F"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={() => {
              sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
            }}
          >
            <SwatchBook strokeWidth={1} /> Color tokens
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ O" : "Alt Ctrl O"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {threadsEnabled && (
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onPointerDown={() => {
                sidebarToggle(SIDEBAR_ELEMENTS.comments);
              }}
            >
              <MessageCircle strokeWidth={1} /> Comments
              <DropdownMenuShortcut>
                {SYSTEM_OS.MAC ? "⌥ ⌘ O" : "Alt Ctrl O"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={() => {
              sidebarToggle(SIDEBAR_ELEMENTS.nodesTree);
            }}
          >
            <ListTree strokeWidth={1} /> Elements tree
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ E" : "Alt Ctrl E"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
