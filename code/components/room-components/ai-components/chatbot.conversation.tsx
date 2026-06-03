// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
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
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool";
import type { ToolUIPart } from "ai";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Bot,
  BrainCog,
  ClipboardCheck,
  ClipboardX,
  CopyIcon,
  Images,
  RefreshCcwIcon,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@/components/ai-elements/task";
import {
  Attachment,
  AttachmentPreview,
  Attachments,
} from "@/components/ai-elements/attachments";

type ChatBotConversationProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMessages: any[];
};

const WORKFLOW_STATUS_MAPPING: Record<string, string> = {
  running: "processing",
  suspended: "waiting for user input",
  success: "completed",
  bailed: "rejected",
  failed: "failed",
  error: "error",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WORKFLOW_STATUS_ICON_MAPPING: Record<string, any> = {
  "success-images": Images,
  running: BrainCog,
  success: ClipboardCheck,
  error: ClipboardX,
};

const WORKFLOW_STEP_STATUS_MAPPING: Record<string, string> = {
  running: "processing",
  suspended: "waiting for user input",
  success: "completed",
  bailed: "rejected",
  failed: "failed",
  error: "error",
};

const WORKFLOW_NAME_MAPPING: Record<string, string> = {
  "weave-workflow": "Weave.js AI",
  "image-generation-or-edit-workflow": "Image generation or edition",
  "room-edition-workflow": "Room edition",
};

const WORKFLOW_STEP_MAPPING: Record<string, string> = {
  "room-edition-references-extraction": "Metadata extraction",
  "room-edition-plan": "Planning",
  "room-edition-plan-confirmation": "Confirmation",
  "room-edition-execution": "Execution",
  "room-edition-result-summary": "Summary",
  "image-generation-or-edition-plan": "Planning",
  "image-generation-or-edition-plan-confirmation": "Confirmation",
  "image-generation-or-edition-execution": "Execution",
  "image-generation-or-edition-result-summary": "Summary",
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

  const { messages, status, regenerate, sendMessage, setMessages } =
    useChat({
      messages: initialMessages,
      resume: false,
      transport: new DefaultChatTransport({
        api: endpoint,
        headers: {
          ai_room_id: room ?? "",
          ai_resource_id: resourceId,
        },
      }),
      onFinish: ({ messages }) => {
        const filteredMessages = messages.map((message) => {
          return {
            ...message,
            parts: message.parts.filter(
              (part) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = (part as any).data;
                return data?.transient === undefined || data?.transient === false;
              }
            ),
          };
        });
        setMessages(filteredMessages);
      },
    });

  React.useEffect(() => {
    setStatus(status);
    setSendMessage(sendMessage);
  }, [
    status,
    setStatus,
    room,
    threadId,
    resourceId,
    sendMessage,
    setSendMessage,
  ]);

  if (!messages) return null;

  return (
    <Conversation className="relative size-full">
      <ConversationContent
        className="gap-4 !py-[24px]"
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

              if (!e.target.dataset.imageUrl) {
                return;
              }

              imageTool.setDragAndDropProperties({
                imageURL: {
                  url: e.target.dataset.imageUrl,
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
        {messages.length > 0 &&
          messages?.map((message, messageIndex) => {
            const attachments = message.parts.filter(
              (part) => part.type === "file",
            );

            return (
              <React.Fragment key={`${message.id}-${messageIndex}`}>
                {message.parts
                  .map((part, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const partAny = part as any;
                    if (
                      ["data-tool-workflow", "data-workflow"].includes(
                        part.type,
                      )
                    ) {
                      const steps = Object.keys(partAny.data.steps).map(
                        (stepKey) => {
                          const step = partAny.data.steps[stepKey];
                          return {
                            key: `${message.id}-${partAny.id}-${part.type}-${stepKey}`,
                            status: step.status,
                            suspendedMetadata: {
                              kind: step?.suspendPayload?.kind,
                              workflowName: step?.suspendPayload?.workflowName,
                              plan: step?.suspendPayload?.plan,
                              question: step?.suspendPayload?.question,
                            },
                            label: WORKFLOW_STEP_MAPPING[stepKey] ?? stepKey,
                            images: step?.output?.images,
                            result: step?.output?.result,
                          };
                        },
                      );

                      const filteredSteps = steps.filter(
                        (step) => step.label.indexOf("mapping_") === -1,
                      );

                      const title = WORKFLOW_NAME_MAPPING[partAny.data.name];
                      const status = WORKFLOW_STATUS_MAPPING[partAny.data.status];
                      const icon =
                        WORKFLOW_STATUS_ICON_MAPPING[partAny.data.status];

                      return (
                        <ChainOfThought
                          key={`${message.id}-${index}`}
                          defaultOpen
                        >
                          <ChainOfThoughtHeader>
                            <div className="flex gap-2 text-sm justify-between items-center">
                              {partAny.data.status === "running" && (
                                <Shimmer>{title}</Shimmer>
                              )}
                              {partAny.data.status !== "running" && title}
                              <Badge
                                className="text-xs font-light"
                                variant={
                                  partAny.data.status === "failed"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {status}
                              </Badge>
                            </div>
                          </ChainOfThoughtHeader>
                          <ChainOfThoughtContent>
                            {filteredSteps.map((step) => (
                              <React.Fragment key={step.key}>
                                <ChainOfThoughtStep
                                  icon={icon}
                                  label={
                                    <div className="flex gap-2 justify-between items-center">
                                      {step.status === "running" && (
                                        <Shimmer>{step.label}</Shimmer>
                                      )}
                                      {step.status !== "running" && step.label}
                                      <Badge
                                        className="text-xs font-light"
                                        variant={
                                          step.status === "failed"
                                            ? "destructive"
                                            : "outline"
                                        }
                                      >
                                        {
                                          WORKFLOW_STEP_STATUS_MAPPING[
                                            step.status
                                          ]
                                        }
                                      </Badge>
                                    </div>
                                  }
                                  description={
                                    step.result && (
                                      <Message from="assistant">
                                        <MessageContent>
                                          <MessageResponse>
                                            {step.result ?? "-"}
                                          </MessageResponse>
                                        </MessageContent>
                                      </Message>
                                    )
                                  }
                                  status={step.status}
                                />
                                {step.status === "suspended" && (
                                  <Confirmation
                                    approval={{ id: step.key }}
                                    state="approval-requested"
                                  >
                                    <ConfirmationTitle>
                                      <ConfirmationRequest>
                                        <Message from={message.role}>
                                          <MessageContent>
                                            {step.suspendedMetadata?.kind ===
                                              "user_decision" && (
                                              <>
                                                <MessageResponse>
                                                  {step.suspendedMetadata?.plan}
                                                </MessageResponse>
                                                <MessageResponse>
                                                  {`----
                                                    
                                                    ${
                                                      step.suspendedMetadata
                                                        ?.question
                                                    }
                                                    `}
                                                </MessageResponse>
                                              </>
                                            )}
                                            {step.suspendedMetadata?.kind ===
                                              "ask_for_information" && (
                                              <MessageResponse>
                                                {
                                                  step.suspendedMetadata
                                                    ?.question
                                                }
                                              </MessageResponse>
                                            )}
                                          </MessageContent>
                                        </Message>
                                      </ConfirmationRequest>
                                    </ConfirmationTitle>
                                    {step.suspendedMetadata?.kind ===
                                      "user_decision" && (
                                      <ConfirmationActions>
                                        <ConfirmationAction
                                          onClick={() => {
                                            sendMessage({
                                              text: "Cancel the execution",
                                              metadata: {
                                                kind: "workflow-step-approval",
                                                name:
                                                  step.suspendedMetadata
                                                    ?.workflowName ?? "",
                                                id: partAny.id ?? "",
                                                approved: false,
                                              },
                                            });
                                          }}
                                          variant="outline"
                                        >
                                          Cancel
                                        </ConfirmationAction>
                                        <ConfirmationAction
                                          onClick={() => {
                                            sendMessage({
                                              text: "Execute the plan",
                                              metadata: {
                                                kind: "workflow-step-approval",
                                                name:
                                                  step.suspendedMetadata
                                                    ?.workflowName ?? "",
                                                id: partAny.id ?? "",
                                                approved: true,
                                              },
                                            });
                                          }}
                                          variant="default"
                                        >
                                          Execute
                                        </ConfirmationAction>
                                      </ConfirmationActions>
                                    )}
                                  </Confirmation>
                                )}
                                {(step?.images ?? []).length > 0 && (
                                  <ChainOfThoughtStep
                                    icon={Images}
                                    label="Generated images"
                                  >
                                    {step?.images.map((image: { imageId: string; url: string }, index: number) => (
                                      <ChainOfThoughtImage
                                        caption={`Image ${index + 1}`}
                                        key={image.imageId}
                                      >
                                        <img
                                          data-image-id={image.imageId}
                                          data-image-url={image.url}
                                          draggable="true"
                                          src={image.url}
                                          alt={`Generated image ${index + 1}`}
                                          className="object-cover aspect-auto border-[0.5px] border-[#c9c9c9] rounded"
                                        />
                                      </ChainOfThoughtImage>
                                    ))}
                                  </ChainOfThoughtStep>
                                )}
                              </React.Fragment>
                            ))}
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      );
                    } else if (part.type === "data-workflow-step-event") {
                      const tasks = partAny.data.tasks;
                      return (
                        <Task className="w-full" key={`${message.id}-${index}`}>
                          <TaskTrigger title={partAny.data.title ?? "Tasks"} />
                          <TaskContent>
                            {tasks.map((task: { id: string; name: string; status: string; tools?: { toolCallId: string; toolName: string; status: string; type: string; args: unknown; result: unknown }[] }) => {
                              let variant: "outline" | "secondary" | "destructive" = "outline";
                              if (
                                ["generated", "completed"].includes(task.status)
                              ) {
                                variant = "secondary";
                              }
                              if (task.status === "failed") {
                                variant = "destructive";
                              }

                              return (
                                <TaskItem key={task.id}>
                                  <div className="w-full flex flex-col justify-start items-center gap-3">
                                    <div className="w-full flex justify-between items-center gap-3">
                                      <span>{task.name}</span>
                                      <Badge
                                        className="font-light text-xs"
                                        variant={variant}
                                      >
                                        {task.status}
                                      </Badge>{" "}
                                    </div>
                                    {(task?.tools ?? []).length > 0 && (
                                      <div className="w-full flex gap-1 flex-col justify-start items-center">
                                        {task.tools!.map((toolCall) => (
                                          <Tool key={toolCall.toolCallId}>
                                            <ToolHeader
                                              state={toolCall.status as ToolPart["state"]}
                                              title={toolCall.toolName.replace(
                                                "weavejsLocal_",
                                                "",
                                              )}
                                              className="cursor-pointer"
                                              type={toolCall.type as ToolUIPart["type"]}
                                            />
                                            <ToolContent>
                                              <ToolInput
                                                input={toolCall.args}
                                              />
                                              <ToolOutput
                                                output={toolCall.result}
                                                errorText={undefined}
                                              />
                                            </ToolContent>
                                          </Tool>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </TaskItem>
                              );
                            })}
                          </TaskContent>
                        </Task>
                      );
                    } else if (part.type === "tool-imageGenerationTool") {
                      if (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (part.output as any)?.code === "TOOL_EXECUTION_FAILED"
                      ) {
                        return (
                          <Message
                            key={`${message.id}-${index}`}
                            from={message.role}
                          >
                            <MessageContent>
                              ❌ Image generation failed. Please try again.
                            </MessageContent>
                          </Message>
                        );
                      }

                      let images = [];
                      if (part.state === "output-available") {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        images = (part.output as any)?.images ?? [];
                      }

                      return (
                        <Message
                          key={`${message.id}-${index}`}
                          from={message.role}
                        >
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
                                        key={`${message.id}-${image.imageId}`}
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
                      );
                    } else if (part.type === "tool-informationTool") {
                      const isLastMessage =
                        messageIndex === messages.length - 1;

                      if (part.state === "output-error") {
                        return (
                          <Message
                            key={`${message.id}-${index}`}
                            from={message.role}
                          >
                            <MessageContent>
                              Failed to retrieve information. Please try again.
                            </MessageContent>
                          </Message>
                        );
                      }

                      if (part.state === "output-available") {
                        return (
                          <Message
                            key={`${message.id}-${index}`}
                            from={message.role}
                          >
                            <MessageContent>
                              <MessageResponse>
                                {(part.output as Record<string, unknown>)?.result as string}
                              </MessageResponse>
                            </MessageContent>
                            {isLastMessage && (
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
                                    navigator.clipboard.writeText(
                                      (part.output as Record<string, unknown>)?.result as string,
                                    )
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </MessageAction>
                              </MessageActions>
                            )}
                          </Message>
                        );
                      }
                    } else if (part.type === "text") {
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

                      const isLastMessage =
                        messageIndex === messages.length - 1;
                      return (
                        <Message
                          key={`${message.id}-${index}`}
                          from={message.role}
                        >
                          {attachments.length > 0 && (
                            <Attachments>
                              {attachments.map((attachment, index) => (
                                <Attachment data={attachment as import("@/components/ai-elements/attachments").AttachmentData} key={index}>
                                  <AttachmentPreview />
                                </Attachment>
                              ))}
                            </Attachments>
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
                      );
                    } else {
                      return null;
                    }
                  })
                  .filter((part) => part !== null)}
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
