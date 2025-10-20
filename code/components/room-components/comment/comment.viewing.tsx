// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheckBig, Check, Trash, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { Button } from "@/components/ui/button";
import { useCollaborationRoom } from "@/store/store";
import { ThreadStatus } from "../hooks/types";
import { putThread } from "@/api/put-thread";
import { eventBus } from "@/components/utils/events-bus";
import { delThread } from "@/api/del-thread";
import { useWeave } from "@inditextech/weave-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComment } from "./use-comment";
import { CommentAnswer } from "./comment.viewing.answer";
import { CommentAnswers } from "./comment.viewing.answers";
import { CommentReply } from "./comment.viewing.reply";
import {
  WEAVE_COMMENT_STATUS,
  WeaveCommentNodeViewAction,
} from "@inditextech/weave-sdk/client";

type CommentViewingProps = {
  node: WeaveElementInstance;
  finish: (
    node: WeaveElementInstance,
    content: string,
    action: WeaveCommentNodeViewAction
  ) => void;
  close: () => void;
};

export const CommentViewing = ({
  node,
  finish,
  close,
}: Readonly<CommentViewingProps>) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const instance = useWeave((state) => state.instance);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);

  const {
    commentId,
    comment: { data: commentData, isLoading: isLoadingComment },
    answers: { data: answerData, isLoading: isLoadingAnswer },
    handleRefreshComment,
    handleRefreshCommentAnswers,
  } = useComment({ node });

  React.useEffect(() => {
    const handlerCommentsChanged = () => {
      handleRefreshComment();
      handleRefreshCommentAnswers();
    };

    eventBus.on("onCommentsChanged", handlerCommentsChanged);

    return () => {
      eventBus.off("onCommentsChanged", handlerCommentsChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const mutateMarkResolvedThread = useMutation({
    mutationFn: async ({
      threadId,
      status,
    }: {
      node: WeaveElementInstance;
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
    onSuccess(_, { node }) {
      finish(node, "", "markResolved");

      eventBus.emit("onCommentsChanged");

      handleRefreshComment();
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to create thread answer");
    },
  });

  const mutateDeleteThread = useMutation({
    mutationFn: async ({
      threadId,
    }: {
      node: WeaveElementInstance;
      threadId: string;
    }) => {
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
    onSuccess(_, { node }) {
      close();
      finish(node, "", "delete");

      eventBus.emit("onCommentsChanged");
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete thread");
    },
  });

  const handleMarkResolvedComment = React.useCallback(() => {
    mutateMarkResolvedThread.mutate({
      node,
      threadId: commentId ?? "",
      status: WEAVE_COMMENT_STATUS.RESOLVED,
    });
  }, [node, commentId, mutateMarkResolvedThread]);

  const handleDeleteComment = React.useCallback(() => {
    mutateDeleteThread.mutate({
      node,
      threadId: commentId ?? "",
    });
  }, [node, commentId, mutateDeleteThread]);

  const handleCloseComment = React.useCallback(() => {
    close();
    finish(node, "", "close");
  }, [node, finish, close]);

  React.useEffect(() => {
    if (scrollAreaRef.current && !isLoadingAnswer) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [answerData, isLoadingAnswer]);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleCloseComment();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleCloseComment]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!instance) return;

      const stage = instance.getStage();
      const target = event.target as HTMLElement;

      const stageContainer = target.closest(`#${stage.container().id}`);

      if (!stageContainer) {
        return;
      }

      if (ref.current && !ref.current.contains(target as Node)) {
        handleCloseComment();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [instance, node, commentId, handleCloseComment]);

  if (!commentData) {
    return null;
  }

  return (
    <motion.div
      id={commentId ?? ""}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: 0 }}
      ref={ref}
      className="w-[320px] max-h-[calc(100dvh-48px)] bg-white border border-[#C9C9C9] shadow pointer-events-auto cursor-default hover:cursor-default"
    >
      <div className="p-2 border-b border-[#C9C9C9] flex justify-between items-center min-h-[24px]">
        <div className="font-inter text-xs min-h-[24px] flex justify-start items-center">
          Comment
        </div>
        <div className="flex justify-end items-center gap-1">
          {commentData?.thread?.userMetadata.name === user?.name &&
            commentData?.thread?.status !== "resolved" && (
              <Button
                className="rounded-none cursor-pointer w-[24px] h-[24px] color-red"
                variant="link"
                disabled={isLoadingComment}
                onClick={handleDeleteComment}
              >
                <Trash strokeWidth={1} size={16} />
              </Button>
            )}
          {!isLoadingComment && (
            <Button
              className="rounded-none cursor-pointer w-[24px] h-[24px]"
              variant="link"
              disabled={commentData?.thread?.status === "resolved"}
              onClick={handleMarkResolvedComment}
            >
              {commentData?.thread?.status === "resolved" ? (
                <Check strokeWidth={1} size={16} />
              ) : (
                <CircleCheckBig strokeWidth={1} size={16} />
              )}
            </Button>
          )}
          <Button
            className="rounded-none cursor-pointer w-[24px] h-[24px]"
            variant="link"
            onClick={handleCloseComment}
          >
            <X strokeWidth={1} size={16} />
          </Button>
        </div>
      </div>
      <div className="w-full max-h-[calc(100dvh-40dvh-41px)]">
        <ScrollArea
          ref={scrollAreaRef}
          className="w-full h-auto max-h-[calc(100dvh-40dvh-41px)] overflow-auto"
          onWheel={(e) => {
            if (e.currentTarget.scrollHeight > e.currentTarget.clientHeight) {
              e.stopPropagation();
            }
          }}
        >
          <div className="w-full p-2 flex flex-col gap-3">
            {isLoadingComment && (
              <div className="w-full flex items-center gap-2">
                <Skeleton className="h-[32px] w-[32px] rounded-full" />
                <div className="w-full flex flex-col gap-2">
                  <Skeleton className="h-2 w-full mt-4" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            )}
            {!isLoadingComment && commentData.thread && (
              <>
                <CommentAnswer
                  node={node}
                  finish={finish}
                  answer={{
                    answerId: "main",
                    threadId: commentData.thread.threadId,
                    userId: commentData.thread.userMetadata.id,
                    userMetadata: commentData.thread.userMetadata,
                    content: commentData.thread.content,
                    createdAt: commentData.thread.createdAt,
                    updatedAt: commentData.thread.updatedAt,
                  }}
                  isMain
                />
                <CommentAnswers node={node} finish={finish} />
              </>
            )}
          </div>
          {commentData?.thread?.status === "pending" && (
            <CommentReply node={node} />
          )}
        </ScrollArea>
      </div>
    </motion.div>
  );
};
