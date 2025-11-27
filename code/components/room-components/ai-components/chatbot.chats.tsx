"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useIAChat } from "@/store/ia-chat";
import { getChats } from "@/api/get-chats";
import { OrbitProgress } from "react-loading-indicators";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";

export const ChatBotChats = () => {
  const resourceId = useIAChat((state) => state.resourceId);
  const setThreadId = useIAChat((state) => state.setThreadId);
  const setAiView = useIAChat((state) => state.setView);

  const { data: chats, isFetching } = useQuery({
    queryKey: ["getChats", resourceId],
    queryFn: () => {
      if (!resourceId) return [];

      return getChats(resourceId);
    },
    enabled: !!resourceId,
  });

  if (isFetching) {
    return (
      <div className="w-full h-full flex flex-col gap-3 justify-center items-center">
        <OrbitProgress color="#000000" size="small" text="" textColor="" />
        <div className="font-inter text-sm">Loading assistant chats</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-auto">
      {chats.length === 0 && (
        <ConversationEmptyState
          description="Ask the bot a question to start a new chat. Or create it by clicking on the create chat button."
          icon={<MessagesSquare className="size-6" />}
          title="AI Assistant"
        />
      )}

      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chats.map((chat: any) => (
          <button
            key={chat.threadId}
            className="w-full flex justify-between items-center p-2 px-[24px] border-b-[0.5px] border-[#c9c9c9] text-left cursor-pointer hover:bg-[#f6f6f6]"
            onClick={() => {
              setThreadId(chat.threadId);
              setAiView("chat");
            }}
          >
            <div className="w-full flex flex-col justify-center items-start">
              <h3 className="font-inter text-base truncate w-full">
                {chat.title || "Untitled Chat"}
              </h3>
              <p className="font-inter text-xs text-gray-600">
                Created at: {new Date(chat.createdAt).toLocaleString()}
              </p>
            </div>
            <ArrowRight strokeWidth={1} size={20} />
          </button>
        ))
      }
    </div>
  );
};
