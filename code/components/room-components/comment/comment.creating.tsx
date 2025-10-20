// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { CommentTextarea } from "./comment-textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CirclePlus } from "lucide-react";
import { WeaveCommentNodeCreateAction } from "@inditextech/weave-sdk/client";

type CommentCreateProps = {
  node: WeaveElementInstance;
  finish: (
    node: WeaveElementInstance,
    content: string,
    action: WeaveCommentNodeCreateAction
  ) => void;
  close: () => void;
};

export const CommentCreating = ({
  node,
  finish,
  close,
}: Readonly<CommentCreateProps>) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = React.useState<string>("");

  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  const handleOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    []
  );

  const handleCreateComment = React.useCallback(() => {
    close();
    finish(node, content, "create");
    setContent("");
  }, [content, node, finish, close]);

  const handleCloseComment = React.useCallback(() => {
    close();
    finish(node, "", "close");
  }, [node, finish, close]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handleCloseComment();
      }
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        handleCloseComment();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [node, handleCloseComment]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        handleCloseComment();
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
      }

      if (e.key === "Enter" && !e.shiftKey && content.trim() !== "") {
        handleCreateComment();
      }

      e.stopPropagation();
    },
    [content, handleCloseComment, handleCreateComment]
  );

  return (
    <div
      ref={ref}
      className="w-[320px] bg-white border border-[#C9C9C9] font-inter shadow pointer-events-auto cursor-default hover:cursor-default"
    >
      <div
        className={cn("flex flex-col gap-1 p-2 ", {
          ["flex-row"]: content.trim() === "",
          ["flex-col"]: content.trim() !== "",
        })}
      >
        <CommentTextarea
          ref={inputRef}
          className="w-full shadow-none font-inter !text-sm !py-[10px] max-h-[calc(100dvh-16px-40px)] border-0 border-black"
          placeholder="Add a comment"
          minRows={1}
          value={content}
          onChange={handleOnChange}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        />
        {content.trim() === "" && (
          <Button
            className="rounded-none h-[40px] cursor-pointer"
            variant="secondary"
            disabled
          >
            <CirclePlus strokeWidth={1} size={16} />
          </Button>
        )}
      </div>
      {content.trim() !== "" && (
        <div
          className={cn({
            ["block"]: content.trim() === "",
            ["flex p-2 justify-end items-center border-t border-[#C9C9C9]"]:
              content.trim() !== "",
          })}
        >
          <Button
            className="rounded-none h-[40px] cursor-pointer"
            variant="secondary"
            disabled={content.trim() === ""}
            onClick={handleCreateComment}
          >
            <CirclePlus strokeWidth={1} size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};
