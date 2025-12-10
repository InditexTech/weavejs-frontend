// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { useIAChat } from "@/store/ia-chat";
import { getChats } from "@/api/get-chats";
import { OrbitProgress } from "react-loading-indicators";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import { useCollaborationRoom } from "@/store/store";

type ChatMessagesPage = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chats: any[];
  limit: number;
  offset: number;
  total: number;
};

const CHATS_LIMIT = 50;

export const ChatBotChats = () => {
  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);

  const resourceId = useIAChat((state) => state.resourceId);
  const setThreadId = useIAChat((state) => state.setThreadId);
  const setAiView = useIAChat((state) => state.setView);

  const { data: chats, isFetching } = useInfiniteQuery<ChatMessagesPage>({
    queryKey: ["getChats", room, resourceId],
    initialPageParam: 0 as number,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.chats.length > 0 ? allPages.length + 1 : undefined,
    queryFn: ({ pageParam = 0 }) => {
      if (!resourceId || !room) return [];

      return getChats(
        room,
        resourceId,
        CHATS_LIMIT,
        (pageParam as number) * CHATS_LIMIT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;
    },
    enabled: !!resourceId && !!room,
  });

  const allChats = chats?.pages.flatMap((page) => page.chats) || [];

  if (isFetching) {
    return (
      <div className="w-full h-full flex flex-col gap-3 justify-center items-center">
        <OrbitProgress color="#000000" size="small" text="" textColor="" />
        <div className="font-inter text-sm">Loading chats</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-auto">
      {allChats.length === 0 && (
        <ConversationEmptyState
          description="Ask the bot a question to start a new chat. Or create it by clicking on the create chat button."
          icon={<MessagesSquare className="size-6" />}
          title="Chats"
        />
      )}

      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allChats.map((chat: any) => (
          <button
            key={chat.chatId}
            className="w-full flex justify-between min-h-[67px] items-center px-[24px] py-[12px] border-b-[0.5px] border-[#c9c9c9] text-left cursor-pointer hover:bg-[#f6f6f6]"
            onClick={() => {
              if (!user) return;
              if (!room) return;

              setThreadId(chat.chatId);
              sessionStorage.setItem(
                `weave.js_${room}_${user.id}_ai_thread_id`,
                chat.chatId
              );
              setAiView("chat");
            }}
          >
            <div className="w-full flex flex-col justify-center items-start">
              <h3 className="font-inter text-base truncate w-full">
                {(chat.title || "Untitled Chat").toUpperCase()}
              </h3>
              <p className="font-inter text-xs text-gray-600">
                Created at: {new Date(chat.updatedAt).toLocaleString()}
              </p>
            </div>
            <ArrowRight strokeWidth={1} size={20} className="h-[40px]" />
          </button>
        ))
      }
    </div>
  );
};
