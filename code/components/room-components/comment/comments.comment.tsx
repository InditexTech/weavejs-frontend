// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar as AvatarUI, AvatarFallback } from "@/components/ui/avatar";
import { useCollaborationRoom } from "@/store/store";
import { Trash, CircleCheckBig, Check } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { ThreadEntity, ThreadStatus } from "../hooks/types";
import { getUserShort } from "@/components/utils/users";
import { putThread } from "@/api/put-thread";
import { delThread } from "@/api/del-thread";
import { eventBus } from "@/components/utils/events-bus";
import { WeaveCommentNode } from "@inditextech/weave-sdk";
import { useGetSession } from "../hooks/use-get-session";

type CommentsCommentProps = {
  thread: ThreadEntity;
  index: number;
  amountOfComments: number;
};

export const CommentsComment = ({
  thread,
  index,
  amountOfComments,
}: Readonly<CommentsCommentProps>) => {
  const instance = useWeave((state) => state.instance);

  const { session } = useGetSession();

  const clientId = useCollaborationRoom((state) => state.clientId);
  const pageId = useCollaborationRoom((state) => state.pages.actualPageId);

  const queryClient = useQueryClient();

  const handleRefreshComments = React.useCallback(() => {
    const queryKey = ["comments", pageId ?? ""];
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, pageId]);

  const mutateMarkResolvedThread = useMutation({
    mutationFn: async ({
      threadId,
      status,
    }: {
      threadId: string;
      status: ThreadStatus;
    }) => {
      if (!session) {
        return { answer: undefined };
      }

      return await putThread({
        userId: session?.user?.id ?? "",
        clientId: clientId ?? "",
        threadId,
        roomId: pageId ?? "",
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
      if (!session) {
        return { status: "KO", message: "User not defined" };
      }

      return await delThread({
        userId: session?.user.id ?? "",
        clientId: clientId ?? "",
        roomId: pageId ?? "",
        threadId,
      });
    },
    onSuccess() {
      if (!instance) return;

      eventBus.emit("onCommentsChanged");

      const commentHandler =
        instance.getNodeHandler<WeaveCommentNode<ThreadEntity>>("comment");

      if (commentHandler) {
        commentHandler.setCommentViewing(null);
      }

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
    [mutateMarkResolvedThread],
  );

  const handleDeleteComment = React.useCallback(
    (threadId: string) => {
      mutateDeleteThread.mutate({
        threadId,
      });
    },
    [mutateDeleteThread],
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
    [instance],
  );

  return (
    <div
      role="button"
      tabIndex={0}
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
              e.stopPropagation();
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
                e.stopPropagation();
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
            <div className="font-light text-xs">
              #{amountOfComments - index} ·
            </div>
            <div className="font-light text-xs truncate">
              {thread.userMetadata.name ?? ""}
            </div>
          </div>
          <div className="font-inter text-xs text-[#C9C9C9] truncate">
            {formatDistanceToNow(new Date(thread.updatedAt).toISOString(), {
              addSuffix: true,
            })}
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
              {thread.replies} {thread.replies === 1 ? "reply" : "replies"}
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
    </div>
  );
};
