"use client";

import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputAttachments,
  PromptInputTools,
  PromptInputSelect,
  PromptInputSelectItem,
  PromptInputSelectContent,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
} from "@/components/ai-elements/prompt-input";
import React from "react";
import { useIAChat } from "@/store/ia-chat";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { Label } from "@/components/ui/label";

const ChatBotPrompt = () => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [imagesAmount, setImagesAmount] = React.useState<string>("1");
  const [imageAspectRatio, setImageAspectRatio] = React.useState<string>("1:1");
  const [imagesSize, setImagesSize] = React.useState<string>("1K");

  const status = useIAChat((state) => state.status);
  const sendMessage = useIAChat((state) => state.sendMessage);
  const setAiView = useIAChat((state) => state.setView);

  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const handleSubmit = React.useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      console.log("Submitting prompt input message:", message, hasAttachments);

      if (!(hasText || hasAttachments)) {
        return;
      }

      console.log("Sending message to AI chat:", message);

      if (!sendMessage) {
        console.warn("sendMessage function is not set.");
        return;
      }

      sendMessage(message, {
        body: {
          imageOptions: {
            samples: parseInt(imagesAmount, 10),
            aspectRatio: imageAspectRatio,
            imageSize: imagesSize,
          },
        },
      });
      setAiView("chat");
      setSidebarActive(SIDEBAR_ELEMENTS.aiChat);
    },
    [
      imagesAmount,
      imageAspectRatio,
      imagesSize,
      sendMessage,
      setAiView,
      setSidebarActive,
    ]
  );

  const attachments = usePromptInputAttachments();

  return (
    <div className="pointer-events-none fixed bottom-[10px] left-[20px] right-[420px] flex justify-center items-center">
      <div className="w-6/12 pointer-events-auto border border-[#c9c9c9]">
        {attachments.files.length > 0 && (
          <div className="w-full bg-white border-b border-[#c9c9c9] p-3">
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </div>
        )}
        <PromptInput
          globalDrop
          multiple
          onSubmit={handleSubmit}
          className="bg-white flex flex-col"
        >
          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              className="rounded-none"
              placeholder="What do you want to create..."
              onFocus={() => {
                window.weaveOnFieldFocus = true;
              }}
              onBlurCapture={() => {
                window.weaveOnFieldFocus = false;
              }}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools className="gap-4">
              <div className="flex justify-start items-center gap-2">
                <Label className="font-inter text-xs">Amount</Label>
                <PromptInputSelect
                  value={imagesAmount}
                  onValueChange={setImagesAmount}
                >
                  <PromptInputSelectTrigger className="cursor-pointer font-inter text-xs">
                    <PromptInputSelectValue
                      placeholder="Amount"
                      className="font-inter text-xs"
                    />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent className="rounded-none">
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="1"
                    >
                      1
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="2"
                    >
                      2
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="3"
                    >
                      3
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="4"
                    >
                      4
                    </PromptInputSelectItem>
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </div>
              <div className="flex justify-start items-center gap-2">
                <Label className="font-inter text-xs">Aspect Ratio</Label>
                <PromptInputSelect
                  value={imageAspectRatio}
                  onValueChange={setImageAspectRatio}
                >
                  <PromptInputSelectTrigger className="cursor-pointer font-inter  text-xs">
                    <PromptInputSelectValue
                      placeholder="Aspect Ratio"
                      className="font-inter  text-xs"
                    />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent className="rounded-none">
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="1:1"
                    >
                      1:1
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="2:3"
                    >
                      2:3
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="3:2"
                    >
                      3:2
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="3:4"
                    >
                      3:4
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="4:3"
                    >
                      4:3
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="9:16"
                    >
                      9:16
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="16:9"
                    >
                      16:9
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer rounded-none font-inter text-xs"
                      value="21:9"
                    >
                      21:9
                    </PromptInputSelectItem>
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </div>
              <div className="flex justify-start items-center gap-2">
                <Label className="font-inter text-xs">Size</Label>
                <PromptInputSelect
                  value={imagesSize}
                  onValueChange={setImagesSize}
                >
                  <PromptInputSelectTrigger className="cursor-pointer font-inter text-xs">
                    <PromptInputSelectValue
                      placeholder="Size"
                      className="font-inter  text-xs"
                    />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent className="rounded-none">
                    <PromptInputSelectItem
                      className="cursor-pointer font-inter rounded-none text-xs"
                      value="1K"
                    >
                      1K
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer font-inter rounded-none text-xs"
                      value="2K"
                    >
                      2K
                    </PromptInputSelectItem>
                    <PromptInputSelectItem
                      className="cursor-pointer font-inter rounded-none text-xs"
                      value="4K"
                    >
                      4K
                    </PromptInputSelectItem>
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </div>
            </PromptInputTools>
            <PromptInputSubmit
              className="cursor-pointer rounded-none"
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotPrompt;
