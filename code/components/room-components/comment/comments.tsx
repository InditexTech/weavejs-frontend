// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { useCollaborationRoom } from "@/store/store";
import { Ellipsis, Check, Clock } from "lucide-react";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { getThreads } from "@/api/get-threads";
import { useWeave } from "@inditextech/weave-react";
import { ThreadEntity } from "../hooks/types";
import { eventBus } from "@/components/utils/events-bus";
import { WEAVE_INSTANCE_STATUS } from "@inditextech/weave-types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  WeaveCommentNode,
  WeaveCommentsRendererPlugin,
} from "@inditextech/weave-sdk";
import { SidebarHeader } from "../sidebar-header";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { CommentsComment } from "./comments.comment";

export const Comments = () => {
  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const pageId = useCollaborationRoom((state) => state.pages.actualPageId);
  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
  const commentsStatus = useCollaborationRoom((state) => state.comments.status);
  const setCommentsStatus = useCollaborationRoom(
    (state) => state.setCommentsStatus,
  );

  const [menuOpen, setMenuOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const handleRefreshComments = React.useCallback(() => {
    const queryKey = ["comments", pageId ?? ""];
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, pageId]);

  const { data, refetch, error, isLoading } = useQuery({
    queryKey: ["comments", pageId ?? ""],
    queryFn: () => {
      if (!pageId) {
        return Promise.resolve({ items: [], total: 0 });
      }

      return getThreads(pageId ?? "", commentsStatus, true);
    },
    enabled: typeof instance !== "undefined",
  });

  React.useEffect(() => {
    const handlerCommentsChanged = () => {
      handleRefreshComments();
    };

    eventBus.on("onCommentsChanged", handlerCommentsChanged);

    return () => {
      eventBus.off("onCommentsChanged", handlerCommentsChanged);
    };
  }, [handleRefreshComments]);

  React.useEffect(() => {
    refetch();
  }, [commentsStatus, refetch]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (isLoading && error) {
      return;
    }

    if (status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded && data?.items) {
      const commentsRendererPlugin =
        instance.getPlugin<WeaveCommentsRendererPlugin<ThreadEntity>>(
          "commentsRenderer",
        );
      commentsRendererPlugin?.setComments(data.items);
      commentsRendererPlugin?.render();
    }
  }, [instance, status, roomLoaded, data?.items, error, isLoading]);

  return (
    <div
      className={cn("w-full h-full", {
        ["hidden pointer-events-none"]:
          sidebarActive !== SIDEBAR_ELEMENTS.comments,
        ["block pointer-events-auto"]:
          sidebarActive === SIDEBAR_ELEMENTS.comments,
      })}
    >
      <SidebarHeader
        actions={
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <ToolbarButton
                icon={
                  <Ellipsis
                    size={20}
                    className="group-disabled:text-[#cccccc]"
                    strokeWidth={1}
                  />
                }
                onClick={() => {
                  setMenuOpen(!menuOpen);
                }}
                size="small"
                variant="squared"
                tooltipSideOffset={4}
                tooltipSide="bottom"
                tooltipAlign="end"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              sideOffset={12}
              className="rounded-none p-0 !shadow-none !drop-shadow"
            >
              <DropdownMenuItem
                className="text-foreground cursor-default hover:rounded-none w-full text-xs"
                onClick={() => {
                  if (!instance) {
                    return;
                  }

                  const newCommentsStatus =
                    commentsStatus === "pending" ? "all" : "pending";
                  setCommentsStatus(newCommentsStatus);
                  setMenuOpen(false);

                  const commentsHandler =
                    instance.getNodeHandler<WeaveCommentNode<ThreadEntity>>(
                      "comment",
                    );

                  if (commentsHandler) {
                    commentsHandler.setShowResolved(
                      newCommentsStatus === "all",
                    );
                  }

                  handleRefreshComments();
                }}
              >
                <Checkbox checked={commentsStatus === "all"} />
                Show resolved comments
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      >
        <SidebarSelector title="Comments" />
      </SidebarHeader>
      {isLoading && (
        <div className="w-full h-[calc(100%-57px-40px)] font-inter text-sm flex justify-center items-center">
          Loading...
        </div>
      )}
      {!isLoading && data.items.length === 0 && (
        <div className="w-full h-[calc(100%-57px-40px)] font-inter text-sm flex justify-center items-center">
          No comments yet
        </div>
      )}
      {!isLoading && data.items.length > 0 && (
        <ScrollArea className="w-full h-[calc(100%-57px-40px)] overflow-auto">
          <div className="flex flex-col gap-3 w-full p-5">
            {data.items.map((thread: ThreadEntity, index: number) => {
              return (
                <CommentsComment
                  key={thread.threadId}
                  thread={thread}
                  index={index}
                  amountOfComments={data.items.length}
                />
              );
            })}
          </div>
        </ScrollArea>
      )}
      <div className="w-full h-[40px] px-[24px] flex gap-3 justify-center items-center border-t border-[#c9c9c9]">
        <div className="flex justify-start items-center gap-2">
          <div className="flex flex-inline gap-1 font-inter text-xs text-[#cd4b00]">
            <Clock strokeWidth={1} size={16} /> pending
          </div>
          <Badge variant="secondary" className="font-inter !text-xs">
            {data?.items?.filter((c: ThreadEntity) => c.status === "pending")
              .length ?? 0}
          </Badge>
        </div>
        {commentsStatus === "all" && (
          <>
            <div>·</div>
            <div className="flex justify-start items-center gap-2">
              <div className="flex flex-inline gap-1 font-inter text-xs text-[#238830]">
                <Check strokeWidth={1} size={16} /> resolved
              </div>
              <Badge variant="secondary" className="font-inter !text-xs">
                {data?.items?.filter(
                  (c: ThreadEntity) => c.status === "resolved",
                ).length ?? 0}
              </Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
