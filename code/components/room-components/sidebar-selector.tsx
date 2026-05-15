// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { useWeave } from "@inditextech/weave-react";
import { useIAChat } from "@/store/ia-chat";
import { formatForDisplay } from "@tanstack/react-hotkeys";

type SidebarSelectorProps = {
  title: string;
};

export const SidebarSelector = ({ title }: Readonly<SidebarSelectorProps>) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const selectedNodes = useWeave((state) => state.selection.nodes);

  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads,
  );

  const aiChatEnabled = useIAChat((state) => state.enabled);

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
  );

  return (
    <DropdownMenu
      onOpenChange={(open: boolean) => setMenuOpen(open)}
      open={menuOpen}
      modal={false}
    >
      <DropdownMenuTrigger
        className={cn(
          "flex gap-2 rounded-none h-[32px] font-inter font-light text-lg hover:text-[#c9c9c9] justify-start items-center uppercase cursor-pointer focus:outline-none",
          {
            ["font-light text-[#c9c9c9]"]: menuOpen,
            ["font-light"]: !menuOpen,
          },
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
          {selectedNodes.length > 0 && (
            <>
              <DropdownMenuItem
                className="font-light text-xs cursor-pointer hover:rounded-none w-full"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  sidebarToggle(SIDEBAR_ELEMENTS.nodeProperties);
                }}
              >
                Selection
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.images);
            }}
          >
            Images
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+I")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.videos);
            }}
          >
            Videos
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+V")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.frames);
            }}
          >
            Frames
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+F")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.guides);
            }}
          >
            Guides
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+G")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            className="font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.templates);
            }}
          >
            Templates
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+T")}
            </DropdownMenuShortcut>
          </DropdownMenuItem> */}
          <DropdownMenuItem
            className="font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
            }}
          >
            Color tokens
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+C")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {threadsEnabled && (
            <DropdownMenuItem
              className="font-light text-xs cursor-pointer hover:rounded-none w-full"
              onPointerDown={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.comments);
              }}
            >
              Comments
              <DropdownMenuShortcut>
                {formatForDisplay("Shift+O")}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {aiChatEnabled && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="font-light text-xs cursor-pointer hover:rounded-none w-full"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  sidebarToggle(SIDEBAR_ELEMENTS.aiChat);
                }}
              >
                AI Assistant
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
