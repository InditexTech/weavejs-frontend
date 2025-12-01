"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleMore, MessageCircleX } from "lucide-react";
import { useIAChat } from "@/store/ia-chat";
import { Chat } from "@/mastra/manager/chat";
import { ChatBotDialogDeleteChat } from "./chatbot.dialog.delete-chat";

type ChatBotChatInfoProps = {
  chat?: Chat;
};

export const ChatBotChatInfo = ({ chat }: ChatBotChatInfoProps) => {
  const [threadToDelete, setThreadToDelete] = React.useState<string | null>(
    null
  );
  const [openThreadDelete, setOpenThreadDelete] =
    React.useState<boolean>(false);

  const aiView = useIAChat((state) => state.view);
  const setAiView = useIAChat((state) => state.setView);

  if (chat === undefined || aiView !== "chat") {
    return null;
  }

  return (
    <>
      <div className="w-full flex justify-between items-center px-[24px] py-[12px] gap-1 border-b-[0.5px] border-[#c9c9c9]">
        <div className="w-full flex flex-col text-left">
          <div className="truncate text-base font-inter uppercase">
            {chat?.title || "Untitled Chat"}
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
