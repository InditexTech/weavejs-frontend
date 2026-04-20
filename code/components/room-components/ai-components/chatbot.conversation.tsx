// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  useConversationScroll,
} from "@/components/ai-elements/conversation";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
  MessageAttachments,
  MessageAttachment,
} from "@/components/ai-elements/message";
import { Bot, CopyIcon, RefreshCcwIcon } from "lucide-react";
import React from "react";
import { useIAChat } from "@/store/ia-chat";
import { ThreeDot } from "react-loading-indicators";
import { GeneratedImage } from "@google/genai";
import { useCollaborationRoom } from "@/store/store";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WeaveImageToolAction,
} from "@inditextech/weave-sdk";
import { useWeave } from "@inditextech/weave-react";
import { ChatBotImage } from "./chatbot.image";

type ChatBotConversationProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMessages: any[];
};

export const ChatBotConversation = ({
  initialMessages,
}: ChatBotConversationProps) => {
  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);

  const threadId = useIAChat((state) => state.threadId);
  const resourceId = useIAChat((state) => state.resourceId);
  const setStatus = useIAChat((state) => state.setStatus);
  const setSendMessage = useIAChat((state) => state.setSendMessage);

  const appHost = import.meta.env.VITE_APP_HOST;
  const endpoint = `${appHost}/api/ai/chats/${threadId}`;

  const { messages, status, regenerate, sendMessage } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: endpoint,
      headers: {
        ai_room_id: room ?? "",
        ai_resource_id: resourceId,
      },
    }),
  });

  React.useEffect(() => {
    setStatus(status);
    setSendMessage(sendMessage);
  }, [status, setStatus, sendMessage, setSendMessage]);

  if (!messages) return null;

  return (
    <Conversation className="relative size-full">
      <ConversationState />
      <ConversationContent
        className="gap-4 !px-5 !py-[24px]"
        onDragStart={(e) => {
          if (e.target instanceof HTMLImageElement) {
            if (!instance) {
              return;
            }

            if (e.target instanceof HTMLImageElement) {
              const imageTool = instance.getActionHandler(
                WEAVE_IMAGE_TOOL_ACTION_NAME,
              ) as WeaveImageToolAction | undefined;

              if (!imageTool) {
                return;
              }

              if (
                !e.target.dataset.imageFallback ||
                !e.target.dataset.imageUrl
              ) {
                return;
              }

              imageTool.setDragAndDropProperties({
                imageURL: {
                  url: e.target.dataset.imageUrl,
                  fallback: e.target.dataset.imageFallback,
                  width: e.target.naturalWidth,
                  height: e.target.naturalHeight,
                },
                imageId: e.target.dataset.imageId,
              });
            }
          }
        }}
      >
        {messages.length === 0 && (
          <ConversationEmptyState
            description="Messages will appear here as the conversation with the agent progresses."
            icon={<Bot className="size-6" />}
            title="AI Assistant"
          />
        )}
        {messages?.map((message, messageIndex) => {
          const attachments = message.parts.filter(
            (part) => part.type === "file",
          );

          return (
            <React.Fragment key={`${message.id}-${messageIndex}`}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "tool-imageGenerationTool": {
                    if (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (part.output as any)?.code === "TOOL_EXECUTION_FAILED"
                    ) {
                      return (
                        <React.Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              ❌ Image generation failed. Please try again.
                            </MessageContent>
                          </Message>
                        </React.Fragment>
                      );
                    }

                    let images = [];
                    if (part.state === "output-available") {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      images = (part.output as any)?.images ?? [];
                    }

                    return (
                      <React.Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <Tool>
                            <ToolHeader
                              state={part.state}
                              title="image generation"
                              className="cursor-pointer"
                              type={part.type}
                            />
                            <ToolContent>
                              <ToolInput input={part.input} />
                              <ToolOutput
                                errorText={part.errorText}
                                output={part.output}
                              />
                            </ToolContent>
                          </Tool>
                          <MessageContent>
                            {part.state === "output-available" && (
                              <>
                                <div>Here are the results:</div>
                                <div className="grid grid-cols-1 gap-1">
                                  {(images ?? ([] as GeneratedImage[]))
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .map((image: any) => (
                                      <div
                                        key={image.imageId}
                                        className="relative"
                                      >
                                        <ChatBotImage image={image} />
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}
                          </MessageContent>
                        </Message>
                      </React.Fragment>
                    );
                  }
                  case "text": {
                    let isJson = false;
                    try {
                      JSON.parse(part.text);
                      isJson = true;
                    } catch {
                      isJson = false;
                    }

                    if (isJson) {
                      return null;
                    }

                    const isLastMessage = messageIndex === messages.length - 1;
                    return (
                      <React.Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          {attachments.length > 0 && (
                            <MessageAttachments>
                              {attachments.map((attachment, index) => (
                                <MessageAttachment
                                  data={attachment}
                                  key={index}
                                />
                              ))}
                            </MessageAttachments>
                          )}
                          <MessageContent>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                          {message.role === "assistant" && isLastMessage && (
                            <MessageActions>
                              <MessageAction
                                variant="default"
                                size="sm"
                                className="w-[40px] cursor-pointer"
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </MessageAction>
                              <MessageAction
                                variant="default"
                                size="sm"
                                className="w-[40px] cursor-pointer"
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </MessageAction>
                            </MessageActions>
                          )}
                        </Message>
                      </React.Fragment>
                    );
                  }
                  default:
                    return null;
                }
              })}
            </React.Fragment>
          );
        })}
        {["submitted", "streaming"].includes(status) && (
          <Message from="assistant">
            <MessageContent>
              <ThreeDot color="#000000" size="small" text="" textColor="" />
            </MessageContent>
          </Message>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
};

const ConversationState = () => {
  const setScrollToBottom = useIAChat((state) => state.setScrollToBottom);

  const { scrollToBottom } = useConversationScroll();

  React.useEffect(() => {
    setScrollToBottom(scrollToBottom);
  }, [setScrollToBottom, scrollToBottom]);

  return null;
};
