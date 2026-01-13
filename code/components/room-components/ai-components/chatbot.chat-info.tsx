// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Check, MessageCircleMore, MessageCircleX, Pencil } from "lucide-react";
import { useIAChat } from "@/store/ia-chat";
import { ChatBotDialogDeleteChat } from "./chatbot.dialog.delete-chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putChat } from "@/api/put-chat";
import { useCollaborationRoom } from "@/store/store";

type ChatBotChatInfoProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chat?: any;
};

export const ChatBotChatInfo = ({ chat }: ChatBotChatInfoProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const toastRef = React.useRef<string | number | null>(null);

  const room = useCollaborationRoom((state) => state.room);
  const threadId = useIAChat((state) => state.threadId);
  const resourceId = useIAChat((state) => state.resourceId);

  const [title, setTitle] = React.useState<string>(chat?.title || "");
  const [editing, setEditing] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [threadToDelete, setThreadToDelete] = React.useState<string | null>(
    null
  );
  const [openThreadDelete, setOpenThreadDelete] =
    React.useState<boolean>(false);

  const aiView = useIAChat((state) => state.view);
  const setAiView = useIAChat((state) => state.setView);

  const queryClient = useQueryClient();

  const mutationEdit = useMutation({
    mutationFn: async (title: string) => {
      setSaving(true);
      const id = toast.loading("Saving chat title...");
      toastRef.current = id;
      return await putChat(room ?? "", threadId, resourceId, { title });
    },
    onSettled() {
      setSaving(false);
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
      }
    },
    onSuccess() {
      const queryKey = ["getChat", room, threadId, resourceId];
      queryClient.invalidateQueries({ queryKey });

      setSaving(false);
      setEditing(false);
    },
    onError() {
      toast.error("An error occurred saving the chat title, please try again.");
    },
  });

  React.useEffect(() => {
    if (editing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [editing]);

  if (chat === undefined || aiView !== "chat") {
    return null;
  }

  return (
    <>
      <div className="w-full flex justify-between items-center min-h-[67px] px-[24px] py-[12px] gap-5 border-b-[0.5px] border-[#c9c9c9]">
        <div className="w-full flex flex-col text-left">
          <div className="truncate text-base font-inter uppercase">
            {!editing && (chat?.title || "Untitled Chat")}
            {editing && (
              <input
                ref={inputRef}
                onFocus={() => {
                  window.weaveOnFieldFocus = true;
                }}
                onBlurCapture={() => {
                  window.weaveOnFieldFocus = false;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    mutationEdit.mutate(title);
                  }
                }}
                className="w-full border border-[#c9c9c9] uppercase"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            )}
          </div>
          <div className="w-full text-xs font-inter uppercase truncate">
            {new Date(chat.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-3 justify-end items-center">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:text-[#c9c9c9]"
                  disabled={saving}
                  onClick={() => {
                    if (!editing) {
                      setTitle(chat.title);
                      setEditing(true);
                    } else {
                      mutationEdit.mutate(title);
                    }
                  }}
                >
                  {!editing ? (
                    <Pencil size={20} strokeWidth={1} />
                  ) : (
                    <Check size={20} strokeWidth={1} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={8}
                side="bottom"
                align="end"
                className="rounded-none"
              >
                Edit chat title
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:text-[#c9c9c9]"
                  onClick={() => {
                    setAiView("chats");
                  }}
                >
                  <MessageCircleMore size={20} strokeWidth={1} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={8}
                side="bottom"
                align="end"
                className="rounded-none"
              >
                Change chat
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:text-[#c9c9c9]"
                  onClick={() => {
                    setThreadToDelete(chat.chatId);
                    setOpenThreadDelete(true);
                  }}
                >
                  <MessageCircleX color="red" size={20} strokeWidth={1} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={8}
                side="bottom"
                align="end"
                className="rounded-none"
              >
                Delete chat
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {threadToDelete && (
        <ChatBotDialogDeleteChat
          threadId={threadToDelete}
          open={openThreadDelete}
          setOpen={setOpenThreadDelete}
        />
      )}
    </>
  );
};
