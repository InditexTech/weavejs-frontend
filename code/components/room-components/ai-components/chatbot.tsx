// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarSelector } from "../sidebar-selector";
import { SidebarHeader } from "../sidebar-header";
import { ChatBotConversation } from "./chatbot.conversation";
import { getChat } from "@/api/get-chat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCirclePlus } from "lucide-react";
import { useIAChat } from "@/store/ia-chat";
import { ChatBotChats } from "./chatbot.chats";
import { useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import { OrbitProgress } from "react-loading-indicators";
import { postChat } from "@/api/post-chat";
import { ChatBotChatInfo } from "./chatbot.chat-info";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { useGetSession } from "../hooks/use-get-session";

export const ChatBot = () => {
  const actualRoomRef = React.useRef<string | null>(null);

  const threadId = useIAChat((state) => state.threadId);
  const resourceId = useIAChat((state) => state.resourceId);
  const aiView = useIAChat((state) => state.view);
  const setThreadId = useIAChat((state) => state.setThreadId);
  const setResourceId = useIAChat((state) => state.setResourceId);
  const setAiView = useIAChat((state) => state.setView);

  const { session } = useGetSession();

  const room = useCollaborationRoom((state) => state.room);
  const activeSidebar = useCollaborationRoom((state) => state.sidebar.active);

  const queryClient = useQueryClient();

  const mutationCreateChat = useMutation({
    mutationFn: async ({
      roomId,
      chatId,
      resourceId,
    }: {
      roomId: string;
      chatId: string;
      resourceId: string;
    }) => {
      return await postChat(roomId, chatId, resourceId, {
        status: "active",
        title: "Untitled chat",
      });
    },
  });

  const {
    data: chatData,
    isFetched,
    isFetching,
    refetch,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useQuery<any>({
    queryKey: ["getChat", room, threadId, resourceId],
    queryFn: () => {
      if (!room || !threadId || !resourceId) return [];

      return getChat(room, threadId, resourceId);
    },
    refetchOnWindowFocus: false,
    enabled: threadId !== "undefined" && resourceId !== "undefined",
  });

  React.useEffect(() => {
    async function createDefaultChat() {
      await mutationCreateChat.mutate({
        roomId: room ?? "",
        chatId: threadId,
        resourceId: resourceId ?? "",
      });

      const queryKey = ["getChat", room, threadId, resourceId];
      queryClient.invalidateQueries({ queryKey });
    }

    if (!isFetching && isFetched && !chatData) {
      createDefaultChat();
    }
  }, [
    isFetched,
    queryClient,
    mutationCreateChat,
    isFetching,
    chatData,
    room,
    threadId,
    resourceId,
  ]);

  React.useEffect(() => {
    if (!room) return;

    let actualThreadId = "undefined";
    let defineThreadId = false;

    const actualResourceId = `${room}-${session?.user.id ?? "unknown"}`;

    if (threadId === "undefined" || actualRoomRef.current !== room) {
      const storedThreadId = sessionStorage.getItem(
        `weave.js_${room}_${session?.user.id}_ai_thread_id`,
      );

      if (storedThreadId) {
        actualThreadId = storedThreadId;
      } else {
        actualThreadId = uuidv4();
        sessionStorage.setItem(
          `weave.js_${room}_${session?.user.id}_ai_thread_id`,
          actualThreadId,
        );
      }

      defineThreadId = true;
    }

    if (defineThreadId) {
      setThreadId(actualThreadId);
      setResourceId(actualResourceId);
      actualRoomRef.current = room;
      refetch();
    }
  }, [
    session,
    room,
    threadId,
    resourceId,
    refetch,
    setThreadId,
    setResourceId,
  ]);

  // if (activeSidebar !== SIDEBAR_ELEMENTS.aiChat) {
  //   return null;
  // }

  return (
    <>
      <div
        className={cn("w-full h-full", {
          ["hidden pointer-events-none"]:
            activeSidebar !== SIDEBAR_ELEMENTS.aiChat,
          ["block pointer-events-auto"]:
            activeSidebar === SIDEBAR_ELEMENTS.aiChat,
        })}
      >
        <SidebarHeader
          actions={
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent w-[20px] h-[20px] hover:text-[#c9c9c9]"
                    onClick={async () => {
                      if (!room) return;

                      const queryKey = ["getChats", resourceId];
                      await queryClient.invalidateQueries({ queryKey });

                      const newTreadId = uuidv4();

                      sessionStorage.setItem(
                        `weave.js_${room}_${session?.user.id}_ai_thread_id`,
                        newTreadId,
                      );

                      await postChat(room, newTreadId, resourceId, {
                        status: "active",
                        title: "Untitled chat",
                      });

                      setThreadId(newTreadId);
                      setAiView("chat");
                    }}
                  >
                    <MessageCirclePlus
                      className="group-disabled:text-[#cccccc]"
                      size={20}
                      strokeWidth={1}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={8}
                  side="bottom"
                  align="end"
                  className="rounded-none"
                >
                  New chat
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          }
        >
          <SidebarSelector title="AI Assistant" />
        </SidebarHeader>
        <ChatBotChatInfo chat={chatData?.chat} />
        <div
          className={cn("", {
            ["h-[calc(100%-57px-67px)]"]: aiView === "chat",
            ["h-[calc(100%-57px)]"]: aiView === "chats",
          })}
        >
          {isFetching && aiView === "chat" && (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <OrbitProgress
                color="#000000"
                size="small"
                text=""
                textColor=""
              />
              <div className="font-inter text-sm">Loading assistant chat</div>
            </div>
          )}
          {!isFetching && aiView === "chat" && (
            <ChatBotConversation initialMessages={chatData?.messages ?? []} />
          )}
          {!isFetching && aiView === "chats" && <ChatBotChats />}
        </div>
      </div>
    </>
  );
};
