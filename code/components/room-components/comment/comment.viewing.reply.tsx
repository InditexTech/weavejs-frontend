// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CirclePlus } from "lucide-react";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { CommentTextarea } from "./comment-textarea";
import { Button } from "@/components/ui/button";
import { useCollaborationRoom } from "@/store/store";
import { postThreadAnswer } from "@/api/post-thread-answer";
import { eventBus } from "@/components/utils/events-bus";
import { useComment } from "./use-comment";
import { useGetSession } from "../hooks/use-get-session";

type CommentReplyProps = {
  node: WeaveElementInstance;
};

export const CommentReply = ({ node }: Readonly<CommentReplyProps>) => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const { session } = useGetSession();

  const clientId = useCollaborationRoom((state) => state.clientId);
  const pageId = useCollaborationRoom((state) => state.pages.actualPageId);

  const [content, setContent] = React.useState<string>("");
  const [replyPersisting, setReplyPersisting] = React.useState<boolean>(false);

  const { commentId, handleRefreshCommentAnswers } = useComment({ node });

  const mutateCreateThreadAnswer = useMutation({
    mutationFn: async ({
      threadId,
      content,
    }: {
      node: WeaveElementInstance;
      threadId: string;
      content: string;
    }) => {
      if (!session) {
        return { answer: undefined };
      }

      return await postThreadAnswer({
        userId: session?.user.id ?? "",
        userMetadata: session?.user,
        clientId: clientId ?? "",
        threadId,
        roomId: pageId ?? "",
        content,
      });
    },
    onSuccess() {
      handleRefreshCommentAnswers();

      eventBus.emit("onCommentsChanged");

      setReplyPersisting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to create thread answer");
    },
  });

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        mutateCreateThreadAnswer.mutate({
          node,
          threadId: commentId ?? "",
          content,
        });
        setContent("");
      }
    },
    [content, node, commentId, mutateCreateThreadAnswer],
  );

  const handleOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [],
  );

  const handleAddCommentReply = React.useCallback(() => {
    mutateCreateThreadAnswer.mutate({
      node,
      threadId: commentId ?? "",
      content,
    });
    setContent("");
  }, [content, node, commentId, mutateCreateThreadAnswer]);

  return (
    <div className="w-full p-2 flex gap-1">
      <CommentTextarea
        ref={inputRef}
        className="w-full shadow-none font-inter !text-xs !py-[11px]"
        value={content}
        disabled={replyPersisting}
        minRows={1}
        placeholder="Reply"
        onChange={handleOnChange}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-end items-center">
        <Button
          className="rounded-none h-[40px] cursor-pointer"
          variant="secondary"
          disabled={content.trim() === "" || replyPersisting}
          onClick={handleAddCommentReply}
        >
          <CirclePlus strokeWidth={1} size={16} />
        </Button>
      </div>
    </div>
  );
};
