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
import { useComment } from "../../hooks/use-comment";
import { useStandaloneUseCase } from "../../store/store";
import { postStandaloneThreadAnswer } from "@/api/standalone/post-standalone-thread-answer";

type CommentReplyProps = {
  node: WeaveElementInstance;
};

export const CommentReply = ({ node }: Readonly<CommentReplyProps>) => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const user = useStandaloneUseCase((state) => state.user);
  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );

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
      if (!user) {
        return { answer: undefined };
      }

      return await postStandaloneThreadAnswer({
        userId: user.name ?? "",
        userMetadata: user,
        instanceId: instanceId ?? "",
        imageId: managingImageId ?? "",
        threadId,
        content,
      });
    },
    onSuccess() {
      handleRefreshCommentAnswers();

      setReplyPersisting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      const event = new CustomEvent("onStandaloneCommentChanged", {
        detail: { node },
      });
      window.dispatchEvent(event);
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
    [content, node, commentId, mutateCreateThreadAnswer]
  );

  const handleOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    []
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
