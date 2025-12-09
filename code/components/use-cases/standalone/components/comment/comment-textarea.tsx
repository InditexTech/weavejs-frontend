// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils"; // shadcn helper

export type CommentTextareaProps = React.ComponentProps<
  typeof TextareaAutosize
>;

const CommentTextarea = React.forwardRef<
  HTMLTextAreaElement,
  CommentTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <TextareaAutosize
      ref={ref}
      className={cn(
        "flex min-h-[40px] w-full rounded-none border border-input focus-visible:!ring-0 bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

CommentTextarea.displayName = "CommentTextarea";

export { CommentTextarea };
