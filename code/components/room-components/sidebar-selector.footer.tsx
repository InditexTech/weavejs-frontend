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
import { cn, SYSTEM_OS } from "@/lib/utils";
import {
  SwatchBook,
  Projector,
  Images,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  LayoutPanelTop,
  SquareMousePointer,
  Video,
  BotMessageSquare,
} from "lucide-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { useWeave } from "@inditextech/weave-react";
import { useIAChat } from "@/store/ia-chat";

const TITLE_MAP: Record<string, string> = {
  [SIDEBAR_ELEMENTS.nodeProperties]: "Selection",
  [SIDEBAR_ELEMENTS.images]: "Images",
  [SIDEBAR_ELEMENTS.videos]: "Videos",
  [SIDEBAR_ELEMENTS.frames]: "Frames",
  [SIDEBAR_ELEMENTS.templates]: "Templates",
  [SIDEBAR_ELEMENTS.colorTokens]: "Color tokens",
  [SIDEBAR_ELEMENTS.comments]: "Comments",
  [SIDEBAR_ELEMENTS.aiChat]: "AI Assistant",
};

export const SidebarSelectorFooter = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isRoomSwitching = useWeave((state) => state.room.switching);
  const selectedNodes = useWeave((state) => state.selection.nodes);

  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
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
            ["pointer-events-none cursor-default text-black opacity-50"]:
              isRoomSwitching,
          },
        )}
      >
        <span>{sidebarActive ? TITLE_MAP[sidebarActive] : "-"}</span>
        {menuOpen ? (
          <ChevronUp size={20} strokeWidth={1} />
        ) : (
          <ChevronDown size={20} strokeWidth={1} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        alignOffset={0}
        sideOffset={9}
        className="font-inter rounded-none"
      >
        <DropdownMenuGroup>
          {selectedNodes.length > 0 && (
            <>
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  sidebarToggle(SIDEBAR_ELEMENTS.nodeProperties);
                }}
              >
                <SquareMousePointer strokeWidth={1} /> Selection
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
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
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.videos);
            }}
          >
            <Video strokeWidth={1} /> Videos
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ V" : "Alt Ctrl V"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
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
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.templates);
            }}
          >
            <LayoutPanelTop strokeWidth={1} /> Templates
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ T" : "Alt Ctrl T"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
            }}
          >
            <SwatchBook strokeWidth={1} /> Color tokens
            <DropdownMenuShortcut>
              {SYSTEM_OS.MAC ? "⌥ ⌘ C" : "Alt Ctrl C"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {threadsEnabled && (
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none w-full"
              onPointerDown={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                sidebarToggle(SIDEBAR_ELEMENTS.comments);
              }}
            >
              <MessageCircle strokeWidth={1} /> Comments
              <DropdownMenuShortcut>
                {SYSTEM_OS.MAC ? "⌥ ⌘ O" : "Alt Ctrl O"}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {aiChatEnabled && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  sidebarToggle(SIDEBAR_ELEMENTS.aiChat);
                }}
              >
                <BotMessageSquare strokeWidth={1} /> AI Assistant
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
