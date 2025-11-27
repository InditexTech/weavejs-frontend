"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Tool,
  ToolContent,
  ToolHeader,
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

type ChatBotConversationProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMessages: any[];
};

export const ChatBotConversation = ({
  initialMessages,
}: ChatBotConversationProps) => {
  const threadId = useIAChat((state) => state.threadId);
  const resourceId = useIAChat((state) => state.resourceId);
  const setStatus = useIAChat((state) => state.setStatus);
  const setSendMessage = useIAChat((state) => state.setSendMessage);

  const { messages, status, regenerate, sendMessage } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: `https://localhost:3000/api/ai/chats/${threadId}`,
      headers: {
        ai_resource_id: resourceId,
      },
    }),
  });

  React.useEffect(() => {
    setStatus(status);
    setSendMessage(sendMessage);
  }, [status, sendMessage]);

  if (!messages) return null;

  return (
    <Conversation className="relative size-full">
      <ConversationContent
        className="gap-4"
        onDragStart={(e) => {
          if (e.target instanceof HTMLImageElement) {
            window.weaveDragImageURL = e.target.src;
            window.weaveDragImageId = e.target.dataset.imageId;
          }
        }}
      >
        {messages.length === 0 && (
          <ConversationEmptyState
            description="Messages will appear here as the conversation progresses."
            icon={<Bot className="size-6" />}
            title="AI Assistant"
          />
        )}
        {messages?.map((message, messageIndex) => {
          const attachments = message.parts.filter(
            (part) => part.type === "file"
          );

          return (
            <React.Fragment key={message.id}>
              {message.parts.map((part, i) => {
                console.log("part", part.type, part);
                switch (part.type) {
                  case "tool-extractGenerationParametersTool":
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

                    return (
                      <React.Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <Tool defaultOpen={false}>
                            <ToolHeader
                              state={part.state}
                              title="generation parameters"
                              type={part.type}
                            />
                            <ToolContent>
                              <ToolOutput
                                errorText={part.errorText}
                                output={part.output}
                              />
                            </ToolContent>
                          </Tool>
                        </Message>
                      </React.Fragment>
                    );
                  case "tool-imageGenerationTool":
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

                    return (
                      <React.Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <Tool>
                            <ToolHeader
                              state={part.state}
                              title="image generation"
                              type={part.type}
                            />
                            <ToolContent>
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
                                  {((part.output ?? []) as GeneratedImage[])
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .map((image: any) => (
                                      <img
                                        key={image.imageId}
                                        src={image.url}
                                        alt="Generated Image"
                                        className="max-h-64 object-contain cursor-pointer border border-[#c9c9c9]"
                                        data-image-id={image.imageId}
                                      />
                                    ))}
                                </div>
                              </>
                            )}
                          </MessageContent>
                        </Message>
                      </React.Fragment>
                    );
                  case "text":
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
