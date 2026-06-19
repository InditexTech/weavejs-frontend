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
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { getVideos } from "@/api/get-videos";
import { getTemplates } from "@/api/get-templates";

type SidebarSelectorProps = {
  title: string;
};

export const SidebarSelector = ({ title }: Readonly<SidebarSelectorProps>) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const selectedNodes = useWeave((state) => state.selection.nodes);

  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads,
  );
  const room = useCollaborationRoom((state) => state.room);

  const aiChatEnabled = useIAChat((state) => state.enabled);

  const AI_AVAILABLE = import.meta.env.VITE_AI_AVAILABLE === "true";

  const framesCount = useCollaborationRoom((state) => state.frames.count);
  const queryClient = useQueryClient();
  const imagesQueryData = queryClient.getQueryData<{
    pages: { total: number }[];
  }>(["getImages", room]);
  const imagesTotal = imagesQueryData?.pages?.[0]?.total ?? null;

  const { data: videosCountData } = useQuery({
    queryKey: ["getVideosCount", room],
    queryFn: () => getVideos(room ?? "", 0, 1),
    enabled: !!room,
    staleTime: 30_000,
  });
  const videosTotal =
    (videosCountData as { total?: number } | undefined)?.total ?? null;

  const { data: templatesCountData } = useQuery({
    queryKey: ["getTemplatesCount", room, "template"],
    queryFn: () => getTemplates(room ?? "", "template", undefined, 0, 1),
    enabled: !!room,
    staleTime: 30_000,
  });
  const templatesTotal =
    (templatesCountData as { total?: number } | undefined)?.total ?? null;

  const formatBadgeCount = (count: number) => (count > 999 ? "+999" : count);

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
          "group flex gap-2 rounded-none h-[32px] font-inter font-light text-lg hover:text-[#c9c9c9] justify-start items-center uppercase cursor-pointer focus:outline-none",
          {
            ["font-light text-[#c9c9c9]"]: menuOpen,
            ["font-light"]: !menuOpen,
          },
        )}
      >
        <span>{title}</span>
        {sidebarActive === SIDEBAR_ELEMENTS.images && imagesTotal !== null && (
          <Badge
            variant="secondary"
            className="h-[18px] min-w-[18px] px-1 rounded-sm font-inter text-[10px] font-normal tabular-nums transition-colors group-hover:bg-zinc-200 group-hover:text-zinc-500"
          >
            {formatBadgeCount(imagesTotal)}
          </Badge>
        )}
        {sidebarActive === SIDEBAR_ELEMENTS.videos && videosTotal !== null && (
          <Badge
            variant="secondary"
            className="h-[18px] min-w-[18px] px-1 rounded-sm font-inter text-[10px] font-normal tabular-nums transition-colors group-hover:bg-zinc-200 group-hover:text-zinc-500"
          >
            {formatBadgeCount(videosTotal)}
          </Badge>
        )}
        {sidebarActive === SIDEBAR_ELEMENTS.frames && framesCount !== null && (
          <Badge
            variant="secondary"
            className="h-[18px] min-w-[18px] px-1 rounded-sm font-inter text-[10px] font-normal tabular-nums transition-colors group-hover:bg-zinc-200 group-hover:text-zinc-500"
          >
            {formatBadgeCount(framesCount)}
          </Badge>
        )}
        {sidebarActive === SIDEBAR_ELEMENTS.templates &&
          templatesTotal !== null && (
            <Badge
              variant="secondary"
              className="h-[18px] min-w-[18px] px-1 rounded-sm font-inter text-[10px] font-normal tabular-nums transition-colors group-hover:bg-zinc-200 group-hover:text-zinc-500"
            >
              {formatBadgeCount(templatesTotal)}
            </Badge>
          )}
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
                <span className="flex-1 ml-2">Selection</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="group font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.images);
            }}
          >
            <span className="flex-1 ml-2">Images</span>
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+I")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="group font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.videos);
            }}
          >
            <span className="flex-1 ml-2">Videos</span>
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+V")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="group font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.frames);
            }}
          >
            <span className="flex-1 ml-2">Frames</span>
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
            <span className="flex-1 ml-2">Guides</span>
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+G")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="group font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.templates);
            }}
          >
            <span className="flex-1 ml-2">Templates</span>
            <DropdownMenuShortcut>
              {formatForDisplay("Shift+T")}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="font-light text-xs cursor-pointer hover:rounded-none w-full"
            onPointerDown={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
            }}
          >
            <span className="flex-1 ml-2">Color tokens</span>
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
              <span className="flex-1 ml-2">Comments</span>
              <DropdownMenuShortcut>
                {formatForDisplay("Shift+O")}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {aiChatEnabled && AI_AVAILABLE && (
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
                <span className="ml-2">AI Assistant</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
