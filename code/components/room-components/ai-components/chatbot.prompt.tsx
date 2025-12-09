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
import { Button } from "@/components/ui/button";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import React from "react";
import { useIAChat } from "@/store/ia-chat";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "lucide-react";

const GEMINI_IMAGE_ASPECT_RATIOS = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
  "21:9",
] as const;

const CHATGPT_IMAGE_ASPECT_RATIOS = ["1:1", "1:5", "5:1"] as const;

const GEMINI_IMAGE_SIZES = ["1K", "2K", "4K"] as const;
const CHATGPT_IMAGE_SIZES = ["256x256", "512x512", "1024x1024"] as const;

const CHATGPT_IMAGE_QUALITIES = ["low", "medium", "high"] as const;

const MODELS = [
  // {
  //   id: "openai/gpt-image-1",
  //   name: "GPT-4o",
  //   chef: "OpenAI",
  //   chefSlug: "openai",
  //   providers: ["openai"],
  // },
  {
    id: "gemini/gemini-3-pro-image-preview",
    name: "Gemini 3 Pro",
    chef: "Gemini",
    chefSlug: "google",
    providers: ["google"],
  },
];

const ChatBotPrompt = () => {
  const [open, setOpen] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const imageModel = useIAChat((state) => state.imageOptions.model);
  const imagesSamples = useIAChat((state) => state.imageOptions.samples);
  const imageAspectRatio = useIAChat((state) => state.imageOptions.aspectRatio);
  const imagesSize = useIAChat((state) => state.imageOptions.size);
  const imageQuality = useIAChat((state) => state.imageOptions.quality);
  const status = useIAChat((state) => state.status);
  const sendMessage = useIAChat((state) => state.sendMessage);
  const setAiView = useIAChat((state) => state.setView);
  const setImageModel = useIAChat((state) => state.setImageModel);
  const setImagesSamples = useIAChat((state) => state.setImageSamples);
  const setImageAspectRatio = useIAChat((state) => state.setImageAspectRatio);
  const setImageSize = useIAChat((state) => state.setImageSize);
  const setImageQuality = useIAChat((state) => state.setImageQuality);
  const scrollToBottom = useIAChat((state) => state.scrollToBottom);

  const selectedModelData = MODELS.find((model) => model.id === imageModel);
  const chefs = Array.from(new Set(MODELS.map((model) => model.chef)));

  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const handleSubmit = React.useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      if (!sendMessage) {
        console.warn("sendMessage function is not set.");
        return;
      }

      if (scrollToBottom) {
        scrollToBottom();
      }

      sendMessage(message, {
        body: {
          imageOption: {
            model: imageModel,
            samples: imagesSamples,
            aspectRatio: imageAspectRatio,
            quality: imageQuality,
            size: imagesSize,
          },
        },
      });
      setAiView("chat");
      setSidebarActive(SIDEBAR_ELEMENTS.aiChat);
    },
    [
      imageModel,
      imagesSamples,
      imageAspectRatio,
      imagesSize,
      imageQuality,
      sendMessage,
      setAiView,
      setSidebarActive,
      scrollToBottom,
    ]
  );

  const attachments = usePromptInputAttachments();

  return (
    <div className="pointer-events-none fixed bottom-[10px] left-[20px] right-[500px] flex justify-center items-center">
      <div className="w-[900px] pointer-events-auto border border-[#c9c9c9]">
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
            <PromptInputTools className="gap-1">
              <ModelSelector onOpenChange={setOpen} open={open}>
                <ModelSelectorTrigger asChild>
                  <Button
                    className="h-[40px] border-[#c9c9c9] rounded-none font-inter text-xs cursor-pointer"
                    variant="outline"
                  >
                    <Label className="font-inter text-xs text-[#c9c9c9]">
                      Model
                    </Label>
                    {selectedModelData?.name && (
                      <ModelSelectorName>
                        {selectedModelData.name}
                      </ModelSelectorName>
                    )}
                  </Button>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {chefs.map((chef) => (
                      <ModelSelectorGroup heading={chef} key={chef}>
                        {MODELS.filter((model) => model.chef === chef).map(
                          (model) => (
                            <ModelSelectorItem
                              key={model.id}
                              onSelect={() => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setImageModel(model.id as any);
                                setOpen(false);
                              }}
                              value={model.id}
                            >
                              <ModelSelectorName>
                                {model.name}
                              </ModelSelectorName>
                              {imageModel === model.id ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <div className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          )
                        )}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
              <PromptInputSelect
                value={`${imagesSamples}`}
                onValueChange={(value) => setImagesSamples(parseInt(value, 10))}
              >
                <PromptInputSelectTrigger className="cursor-pointer font-inter text-xs">
                  <div className="flex justify-start items-center gap-3">
                    <Label className="font-inter text-xs text-[#c9c9c9]">
                      Amount
                    </Label>
                    <PromptInputSelectValue
                      placeholder="Amount"
                      className="font-inter text-black text-xs"
                    />
                  </div>
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
              <PromptInputSelect
                value={imageAspectRatio}
                onValueChange={setImageAspectRatio}
              >
                <PromptInputSelectTrigger className="cursor-pointer font-inter  text-xs">
                  <div className="flex justify-start items-center gap-3">
                    <Label className="font-inter text-xs text-[#c9c9c9]">
                      Aspect Ratio
                    </Label>
                    <PromptInputSelectValue
                      placeholder="Aspect Ratio"
                      className="font-inter text-black text-xs"
                    />
                  </div>
                </PromptInputSelectTrigger>
                <PromptInputSelectContent className="rounded-none">
                  {imageModel === "gemini/gemini-3-pro-image-preview" &&
                    GEMINI_IMAGE_ASPECT_RATIOS.map((ratio) => (
                      <PromptInputSelectItem
                        key={ratio}
                        className="cursor-pointer rounded-none font-inter text-xs"
                        value={ratio}
                      >
                        {ratio}
                      </PromptInputSelectItem>
                    ))}
                  {imageModel === "openai/gpt-image-1" &&
                    CHATGPT_IMAGE_ASPECT_RATIOS.map((ratio) => (
                      <PromptInputSelectItem
                        key={ratio}
                        className="cursor-pointer rounded-none font-inter text-xs"
                        value={ratio}
                      >
                        {ratio}
                      </PromptInputSelectItem>
                    ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
              <PromptInputSelect
                value={imagesSize}
                onValueChange={(value) => {
                  if (value === "") return;
                  setImageSize(value);
                }}
              >
                <PromptInputSelectTrigger className="cursor-pointer font-inter text-xs">
                  <div className="flex justify-start items-center gap-3">
                    <Label className="font-inter text-xs text-[#c9c9c9]">
                      Size
                    </Label>
                    <PromptInputSelectValue
                      placeholder="Size"
                      className="font-inter text-black text-xs"
                    />
                  </div>
                </PromptInputSelectTrigger>
                <PromptInputSelectContent className="rounded-none">
                  {imageModel === "gemini/gemini-3-pro-image-preview" &&
                    GEMINI_IMAGE_SIZES.map((size) => (
                      <PromptInputSelectItem
                        key={size}
                        className="cursor-pointer rounded-none font-inter text-xs"
                        value={size}
                      >
                        {size}
                      </PromptInputSelectItem>
                    ))}
                  {imageModel === "openai/gpt-image-1" &&
                    CHATGPT_IMAGE_SIZES.map((size) => (
                      <PromptInputSelectItem
                        key={size}
                        className="cursor-pointer rounded-none font-inter text-xs"
                        value={size}
                      >
                        {size}
                      </PromptInputSelectItem>
                    ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
              {imageModel === "openai/gpt-image-1" && (
                <PromptInputSelect
                  value={imageQuality}
                  onValueChange={setImageQuality}
                >
                  <PromptInputSelectTrigger className="cursor-pointer font-inter text-xs">
                    <div className="flex justify-start items-center gap-3">
                      <Label className="font-inter text-xs text-[#c9c9c9]">
                        Quality
                      </Label>
                      <PromptInputSelectValue
                        placeholder="Size"
                        className="font-inter text-black text-xs"
                      />
                    </div>
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent className="rounded-none">
                    {CHATGPT_IMAGE_QUALITIES.map((quality) => (
                      <PromptInputSelectItem
                        key={quality}
                        className="cursor-pointer rounded-none font-inter text-xs"
                        value={quality}
                      >
                        {quality}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              )}
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
