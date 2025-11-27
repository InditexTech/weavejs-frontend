"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  MessageCircleMore,
  MessageCirclePlus,
  MessageCircleX,
} from "lucide-react";
import { useIAChat } from "@/store/ia-chat";
import { ChatBotChats } from "./chatbot.chats";
import { useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import { OrbitProgress } from "react-loading-indicators";
import { ChatBotDialogDeleteChat } from "./chatbot.dialog.delete-chat";

export const ChatBot = () => {
  const [threadToDelete, setThreadToDelete] = React.useState<string | null>(
    null
  );
  const [openThreadDelete, setOpenThreadDelete] =
    React.useState<boolean>(false);

  const threadId = useIAChat((state) => state.threadId);
  const resourceId = useIAChat((state) => state.resourceId);
  const metadata = useIAChat((state) => state.metadata);
  const aiView = useIAChat((state) => state.view);
  const setThreadId = useIAChat((state) => state.setThreadId);
  const setResourceId = useIAChat((state) => state.setResourceId);
  const setMetadata = useIAChat((state) => state.setMetadata);
  const setAiView = useIAChat((state) => state.setView);

  const user = useCollaborationRoom((state) => state.user);
  const room = useCollaborationRoom((state) => state.room);

  const queryClient = useQueryClient();

  const {
    data: chatData,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["getChat", threadId],
    queryFn: () => {
      if (!threadId || !resourceId) return [];

      return getChat(threadId, resourceId);
    },
    enabled: threadId !== "undefined" && resourceId !== "undefined",
  });

  React.useEffect(() => {
    if (!user) return;
    if (!room) return;

    let actualThreadId = "undefined";
    let defineThreadId = false;

    const actualResourceId = `${room}-${user.id ?? "unknown"}`;

    if (threadId === "undefined") {
      const storedThreadId = sessionStorage.getItem(
        `weave.js_${room}_${user.id}_ai_thread_id`
      );

      if (storedThreadId) {
        actualThreadId = storedThreadId;
      } else {
        actualThreadId = uuidv4();
        sessionStorage.setItem(
          `weave.js_${room}_${user.id}_ai_thread_id`,
          actualThreadId
        );
      }
      defineThreadId = true;
    }

    if (defineThreadId) {
      setThreadId(actualThreadId);
      setResourceId(actualResourceId);
    }
  }, [user, room, threadId, resourceId]);

  React.useEffect(() => {
    if (
      isFetched &&
      chatData &&
      threadId !== "undefined" &&
      resourceId !== "undefined"
    ) {
      setMetadata(chatData.metadata);
    }
  }, [isFetched, chatData, threadId, resourceId]);

  return (
    <>
      <div className="w-full h-full">
        <SidebarHeader
          actions={
            <div className="flex justify-end items-center gap- h-[40px]">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent w-[20px] h-[20px] hover:text-[#c9c9c9]"
                      onClick={async () => {
                        if (!room || !user) return;

                        const queryKey = ["getChats", resourceId];
                        await queryClient.invalidateQueries({ queryKey });

                        const newTreadId = uuidv4();

                        sessionStorage.setItem(
                          `weave.js_${room}_${user.id}_ai_thread_id`,
                          newTreadId
                        );

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
            </div>
          }
        >
          <SidebarSelector title="AI Assistant" />
        </SidebarHeader>
        {aiView === "chat" && isFetched && (
          <div className="w-full flex justify-between items-center px-[24px] py-[12px] gap-1 border-b-[0.5px] border-[#c9c9c9]">
            <div className="w-full flex flex-col text-left">
              <div className="truncate text-base font-inter uppercase">
                {metadata?.title || "Untitled Chat"}
              </div>
              <div className="w-full text-xs font-inter uppercase truncate">
                {new Date(metadata?.createdAt || "").toLocaleString()}
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
                        setThreadToDelete(threadId);
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
        )}
        <div
          className={cn("", {
            ["h-[calc(100%-65px-80px-65px)]"]: aiView === "chat",
            ["h-[calc(100%-65px-80px)]"]: aiView === "chats",
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
