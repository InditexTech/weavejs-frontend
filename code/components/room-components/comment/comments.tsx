// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar as AvatarUI, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { useCollaborationRoom } from "@/store/store";
import { Trash, CircleCheckBig, X, Ellipsis, Check, Clock } from "lucide-react";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { getThreads } from "@/api/get-threads";
import { useWeave } from "@inditextech/weave-react";
import { ThreadEntity, ThreadStatus } from "../hooks/types";
import { getUserShort } from "@/components/utils/users";
import { putThread } from "@/api/put-thread";
import { delThread } from "@/api/del-thread";
import { eventBus } from "@/components/utils/events-bus";
import { WEAVE_INSTANCE_STATUS } from "@inditextech/weave-types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  WeaveCommentNode,
  WeaveCommentsRendererPlugin,
} from "@inditextech/weave-sdk";

export const Comments = () => {
  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const commentsStatus = useCollaborationRoom((state) => state.comments.status);
  const setCommentsStatus = useCollaborationRoom(
    (state) => state.setCommentsStatus
  );

  const [menuOpen, setMenuOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const handleRefreshComments = React.useCallback(() => {
    const queryKey = ["comments", room ?? ""];
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, room]);

  const { data, refetch, error, isLoading } = useQuery({
    queryKey: ["comments", room ?? ""],
    queryFn: () => {
      return getThreads(room ?? "", commentsStatus, true);
    },
    enabled: typeof instance !== "undefined",
  });

  const mutateMarkResolvedThread = useMutation({
    mutationFn: async ({
      threadId,
      status,
    }: {
      threadId: string;
      status: ThreadStatus;
    }) => {
      if (!user) {
        return { answer: undefined };
      }

      return await putThread({
        userId: user.name ?? "",
        clientId: clientId ?? "",
        threadId,
        roomId: room ?? "",
        status,
      });
    },
    onSuccess() {
      eventBus.emit("onCommentsChanged");
      handleRefreshComments();
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to create thread answer");
    },
  });

  const mutateDeleteThread = useMutation({
    mutationFn: async ({ threadId }: { threadId: string }) => {
      if (!user) {
        return { status: "KO", message: "User not defined" };
      }

      return await delThread({
        userId: user.name ?? "",
        clientId: clientId ?? "",
        roomId: room ?? "",
        threadId,
      });
    },
    onSuccess() {
      eventBus.emit("onCommentsChanged");
      handleRefreshComments();
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete thread");
    },
  });

  const handleMarkResolvedComment = React.useCallback(
    (threadId: string) => {
      mutateMarkResolvedThread.mutate({
        threadId,
        status: "resolved",
      });
    },
    [mutateMarkResolvedThread]
  );

  const handleDeleteComment = React.useCallback(
    (threadId: string) => {
      mutateDeleteThread.mutate({
        threadId,
      });
    },
    [mutateDeleteThread]
  );

  const handleFocusOnNode = React.useCallback(
    (threadId: string) => {
      if (!instance) {
        return;
      }

      const node = instance.getStage().findOne(`#${threadId}`);

      const commentsHandler =
        instance.getNodeHandler<WeaveCommentNode<ThreadEntity>>("comment");

      if (node && commentsHandler) {
        commentsHandler.focusOn(threadId, 0.5);
      }
    },
    [instance]
  );

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
          "commentsRenderer"
        );
      commentsRendererPlugin?.setComments(data.items);
      commentsRendererPlugin?.render();
    }
  }, [instance, status, roomLoaded, data?.items, error, isLoading]);

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.comments) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-[24px] py-[27px] bg-white flex justify-between items-center border-b border-b-[0.5px] border-[#c9c9c9]">
        <div className="flex gap-2 justify-between font-inter font-light items-center text-[24px] uppercase">
          <SidebarSelector title="Comments" />
        </div>
        <div className="flex justify-end items-center gap-4">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer flex justify-center items-center w-[20px] h-[40px] text-center bg-transparent hover:text-[#c9c9c9]">
                <Ellipsis size={20} strokeWidth={1} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              sideOffset={12}
              className="rounded-none p-0"
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
                      "comment"
                    );

                  if (commentsHandler) {
                    commentsHandler.setShowResolved(
                      newCommentsStatus === "all"
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
          <button
            className="cursor-pointer flex justify-center items-center w-[20px] h-[40px] text-center bg-transparent hover:text-[#c9c9c9]"
            onClick={() => {
              setSidebarActive(null);
            }}
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="w-full h-[calc(100%-95px)] font-inter text-sm flex justify-center items-center">
          Loading...
        </div>
      )}
      {!isLoading && data.items.length === 0 && (
        <div className="w-full h-[calc(100%-95px)] font-inter text-sm flex justify-center items-center">
          No comments yet
        </div>
      )}
      {!isLoading && data.items.length > 0 && (
        <ScrollArea className="w-full h-[calc(100%-95px-40px)] overflow-auto">
          <div className="flex flex-col gap-3 w-full p-5">
            {data.items.map((thread: ThreadEntity, index: number) => {
              return (
                <button
                  key={thread.threadId}
                  className="w-full group p-3 hover:bg-[#ededed99] cursor-pointer flex flex-col gap-3"
                  onClick={() => {
                    handleFocusOnNode(thread.threadId);
                  }}
                >
                  <div className="w-full flex justify-between items-center gap-5 group">
                    <div className="flex gap-3 justify-start items-center">
                      <AvatarUI className="w-[32px] h-[32px] bg-muted font-light text-[13] leading-[18px] border-[0.5px] border-[#c9c9c9]">
                        <AvatarFallback className="bg-transparent uppercase">
                          {getUserShort(thread.userMetadata.name ?? "")}
                        </AvatarFallback>
                      </AvatarUI>
                    </div>
                    <div className="flex gap-1 justify-end items-center hidden group-hover:block">
                      <Button
                        className="rounded-none w-[20px] h-[20px] cursor-pointer"
                        variant="link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteComment(thread.threadId);
                        }}
                      >
                        <Trash strokeWidth={1} size={16} className="text-red" />
                      </Button>
                      {thread.status === "pending" && (
                        <Button
                          className="rounded-none w-[20px] h-[20px] cursor-pointer"
                          variant="link"
                          onClick={(e) => {
                            e.preventDefault();
                            handleMarkResolvedComment(thread.threadId);
                          }}
                        >
                          <CircleCheckBig strokeWidth={1} size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="w-full flex flex-col justify-center items-start gap-1">
                    <div className="w-full flex justify-between items-center gap-2">
                      <div className="flex justify-start items-center gap-1">
                        <div className="font-inter text-xs font-bold">
                          #{data.items.length - index} ·
                        </div>
                        <div className="font-inter text-xs font-bold truncate">
                          {thread.userMetadata.name ?? ""}
                        </div>
                      </div>
                      <div className="font-inter text-xs text-[#C9C9C9] truncate">
                        {formatDistanceToNow(
                          new Date(thread.updatedAt).toISOString(),
                          { addSuffix: true }
                        )}
                      </div>
                    </div>
                    <div className="font-inter text-xs text-left whitespace-pre-line line-clamp-[9]">
                      {thread.content}
                    </div>
                    <div className="w-full flex justify-between items-center">
                      {thread.replies > 0 ? (
                        <a
                          href="#"
                          className="font-inter text-xs mt-3 text-[#1a1aff] hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            handleFocusOnNode(thread.threadId);
                          }}
                        >
                          {thread.replies}{" "}
                          {thread.replies === 1 ? "reply" : "replies"}
                        </a>
                      ) : (
                        <div />
                      )}
                      {thread.status === "resolved" && (
                        <div className="flex flex-inline gap-1 font-inter text-xs mt-3 text-[#238830]">
                          <Check strokeWidth={1} size={16} /> resolved
                        </div>
                      )}
                    </div>
                  </div>
                </button>
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
                  (c: ThreadEntity) => c.status === "resolved"
                ).length ?? 0}
              </Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
