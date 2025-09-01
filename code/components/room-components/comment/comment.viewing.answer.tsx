// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar as AvatarUI, AvatarFallback } from "@/components/ui/avatar";
import { Ellipsis, Pencil, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { CommentTextarea } from "./comment-textarea";
import { Button } from "@/components/ui/button";
import { getUserShort } from "@/components/utils/users";
import { cn } from "@/lib/utils";
import { useCollaborationRoom } from "@/store/store";
import { delThreadAnswer } from "@/api/del-thread-answer";
import { ThreadAnswerEntity } from "../hooks/types";
import { putThread } from "@/api/put-thread";
import { putThreadAnswer } from "@/api/put-thread-answer";
import { eventBus } from "@/components/utils/events-bus";
import { useComment } from "./use-comment";
import { WeaveCommentNodeViewAction } from "@inditextech/weave-sdk";

type CommentAnswerProps = {
  node: WeaveElementInstance;
  answer: ThreadAnswerEntity;
  isMain: boolean;
  finish: (
    node: WeaveElementInstance,
    content: string,
    action: WeaveCommentNodeViewAction
  ) => void;
};

export const CommentAnswer = ({
  node,
  answer,
  finish,
  isMain,
}: Readonly<CommentAnswerProps>) => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [content, setContent] = React.useState<string>("");
  const [editPersisting, setEditPersisting] = React.useState<boolean>(false);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);

  const {
    commentId,
    comment: { data: commentData },
    handleRefreshComment,
    handleRefreshCommentAnswers,
  } = useComment({ node });

  const mutateEditThread = useMutation({
    mutationFn: async ({
      threadId,
      content,
    }: {
      node: WeaveElementInstance;
      threadId: string;
      content: string;
    }) => {
      if (!user) {
        return { answer: undefined };
      }

      return await putThread({
        userId: user.name ?? "",
        clientId: clientId ?? "",
        threadId,
        roomId: room ?? "",
        content,
      });
    },
    onSettled() {
      setEditPersisting(false);
      setEditing(false);
    },
    onSuccess(data) {
      finish(node, data.thread.content, "edit");

      handleRefreshComment();

      setContent("");
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to edit thread");
    },
  });

  const mutateEditThreadAnswer = useMutation({
    mutationFn: async ({
      threadId,
      answerId,
      content,
    }: {
      node: WeaveElementInstance;
      threadId: string;
      answerId: string;
      content: string;
    }) => {
      if (!user) {
        return { answer: undefined };
      }

      return await putThreadAnswer({
        userId: user.name ?? "",
        clientId: clientId ?? "",
        threadId,
        answerId,
        roomId: room ?? "",
        content,
      });
    },
    onSettled() {
      setEditPersisting(false);
      setEditing(false);
    },
    onSuccess() {
      eventBus.emit("onCommentsChanged");

      handleRefreshCommentAnswers();
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to edit thread answer");
    },
  });

  const mutateDeleteThreadAnswer = useMutation({
    mutationFn: async ({
      threadId,
      answerId,
    }: {
      node: WeaveElementInstance;
      threadId: string;
      answerId: string;
    }) => {
      if (!user) {
        return { answer: undefined };
      }

      return await delThreadAnswer({
        userId: user.name ?? "",
        clientId: clientId ?? "",
        threadId,
        answerId,
        roomId: room ?? "",
      });
    },
    onSuccess() {
      eventBus.emit("onCommentsChanged");

      handleRefreshCommentAnswers();

      setEditing(false);
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete thread answer");
    },
  });

  const handleOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    []
  );
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (isMain) {
          mutateEditThread.mutate({
            node,
            threadId: commentId ?? "",
            content,
          });
        }
        if (!isMain) {
          mutateEditThreadAnswer.mutate({
            node,
            threadId: commentId ?? "",
            answerId: answer.answerId,
            content,
          });
        }
        setContent("");
      }
    },
    [
      content,
      node,
      commentId,
      mutateEditThread,
      mutateEditThreadAnswer,
      isMain,
      answer,
    ]
  );

  const handleEditThreadOrThreadAnswer = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();

      if (isMain) {
        mutateEditThread.mutate({
          node,
          threadId: commentId ?? "",
          content,
        });
        setEditPersisting(true);
      }
      if (!isMain) {
        mutateEditThreadAnswer.mutate({
          node,
          threadId: commentId ?? "",
          answerId: answer.answerId,
          content,
        });
        setEditPersisting(true);
      }
    },
    [
      node,
      commentId,
      answer,
      content,
      isMain,
      mutateEditThread,
      mutateEditThreadAnswer,
    ]
  );

  const answerDate = React.useMemo(() => {
    return new Date(answer.updatedAt);
  }, [answer.updatedAt]);

  return (
    <div className="w-full flex gap-2">
      <div className="flex justify-between items-start">
        <AvatarUI className="w-[32px] h-[32px] bg-muted font-light text-[13] leading-[18px] border-[0.5px] border-[#c9c9c9]">
          <AvatarFallback className="bg-transparent uppercase">
            {getUserShort(answer.userMetadata.name ?? "")}
          </AvatarFallback>
        </AvatarUI>
        <div></div>
      </div>
      {editing && (
        <div
          className={cn("w-full flex flex-col gap-1 mt-[6px]", {
            ["mt-0"]: editing,
            ["mt-[6px]"]: !editing,
          })}
        >
          <div className="w-full p-0 flex flex-col gap-1">
            <CommentTextarea
              ref={inputRef}
              className="w-full shadow-none font-inter !text-xs !py-[11px]"
              value={content}
              disabled={editPersisting}
              minRows={1}
              placeholder="Reply"
              onChange={handleOnChange}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-end items-center gap-1">
              <Button
                className="rounded-none h-[40px] cursor-pointer"
                variant="destructive"
                disabled={editPersisting}
                onClick={(e) => {
                  e.preventDefault();

                  setEditing(false);
                  setContent("");
                }}
              >
                <X strokeWidth={1} size={16} />
              </Button>
              <Button
                className="rounded-none h-[40px] cursor-pointer"
                variant="secondary"
                disabled={content.trim() === "" || editPersisting}
                onClick={handleEditThreadOrThreadAnswer}
              >
                <Pencil strokeWidth={1} size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
      {!editing && (
        <div className="w-full flex flex-col gap-1 mt-[6px]">
          <div className="flex justify-between gap-3 items-center">
            <div className="w-full flex justify-start items-center gap-2">
              <div className="font-inter text-xs font-bold truncate">
                {answer.userMetadata.name ?? ""}
              </div>
              <div
                className="font-inter text-xs text-[#757575] truncate"
                title={format(answerDate, "yyyy-MM-dd'T'HH:mm:ssxxx")}
              >
                {formatDistanceToNow(answerDate.toISOString(), {
                  addSuffix: true,
                })}
              </div>
            </div>
            {answer.userMetadata.name === user?.name &&
              commentData?.thread?.status !== "resolved" && (
                <DropdownMenu modal={false} open={menuOpen}>
                  <DropdownMenuTrigger
                    className={cn(
                      "rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["font-normal"]: menuOpen,
                        ["font-extralight"]: !menuOpen,
                      }
                    )}
                    asChild
                  >
                    <Button
                      className="rounded-none w-[20px] h-[20px] cursor-pointer"
                      variant="link"
                      onClick={() => setMenuOpen((prev) => !prev)}
                    >
                      <Ellipsis strokeWidth={1} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                    }}
                    onFocusOutside={() => {
                      setMenuOpen(false);
                    }}
                    align="end"
                    side="bottom"
                    alignOffset={0}
                    sideOffset={8}
                    className="font-inter rounded-none shadow-none"
                  >
                    <DropdownMenuItem
                      className="text-foreground cursor-pointer font-inter text-xs hover:rounded-none"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        setContent(answer.content);
                        setEditing(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    {!isMain && (
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer font-inter text-xs hover:rounded-none"
                        onPointerDown={(e) => {
                          e.preventDefault();

                          setMenuOpen(false);
                          mutateDeleteThreadAnswer.mutate({
                            node,
                            threadId: node.getAttrs().threadId,
                            answerId: answer.answerId,
                          });
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
          <div className="font-inter text-xs text-left whitespace-pre-line">
            {answer.content}
          </div>
        </div>
      )}
    </div>
  );
};
