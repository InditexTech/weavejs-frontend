// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScaleLoader } from "react-spinners";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollaborationRoom } from "@/store/store";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { postGenerateImage } from "@/api/post-generate-image-v2";
import { postEditImage } from "@/api/post-edit-image-v2";
import { Logo } from "@/components/utils/logo";
import { ImageReference, useIACapabilities } from "@/store/ia";
import { cn } from "@/lib/utils";
import { useGenerateMask } from "../hooks/use-generate-mask";
import { X } from "lucide-react";
import { ImageModeration, ImageQuality, ImageSize } from "@/api/types";

export function LLMGenerationV2Popup() {
  useKeyboardHandler();

  const [prompt, setPrompt] = React.useState<string>("");
  const [imageSamples, setImageSamples] = React.useState<string>("4");
  const [moderation, setModeration] = React.useState<ImageModeration>("auto");
  const [quality, setQuality] = React.useState<ImageQuality>("medium");
  const [size, setSize] = React.useState<ImageSize>("1024x1024");

  const room = useCollaborationRoom((state) => state.room);
  const setImagesLLMPopupError = useIACapabilities(
    (state) => state.setImagesLLMPopupError
  );
  const imageReferences = useIACapabilities(
    (state) => state.llmPopup.references
  );
  const imagesLLMPopupType = useIACapabilities((state) => state.llmPopup.type);
  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );
  const imagesLLMPopupImageBase64 = useIACapabilities(
    (state) => state.llmPopup.imageBase64
  );
  const imagesLLMPopupState = useIACapabilities(
    (state) => state.llmPopup.state
  );
  const imagesLLMPopupError = useIACapabilities(
    (state) => state.llmPopup.error
  );
  const setImagesLLMPopupState = useIACapabilities(
    (state) => state.setImagesLLMPopupState
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
  );
  const setImagesLLMPredictions = useIACapabilities(
    (state) => state.setImagesLLMPredictions
  );
  const setImagesLLMReferences = useIACapabilities(
    (state) => state.setImagesLLMReferences
  );

  const [actualMaskBase64, actualMaskBase64UI] = useGenerateMask();

  const mutationGenerate = useMutation({
    mutationFn: async () => {
      setImagesLLMPopupState("generating");
      return await postGenerateImage(
        {
          roomId: room ?? "",
          prompt: prompt,
        },
        {
          quality,
          moderation,
          size,
          sampleCount: parseInt(imageSamples),
        }
      );
    },
    onSettled: () => {
      setImagesLLMPopupState("idle");
    },
    onSuccess: (data) => {
      setImagesLLMPopupState("uploading");

      setImagesLLMPredictions(data.data);
    },
    onError(error) {
      setImagesLLMPopupError(error);
    },
  });

  const mutationEdit = useMutation({
    mutationFn: async () => {
      setImagesLLMPopupState("generating");

      if (!imagesLLMPopupImageBase64) {
        throw new Error("No reference image");
      }

      if (imagesLLMPopupType === "edit-mask" && !actualMaskBase64) {
        throw new Error("No mask defined");
      }

      return await postEditImage(
        {
          roomId: room ?? "",
          prompt,
          image: imagesLLMPopupImageBase64,
          ...(imageReferences &&
            imageReferences.length > 0 && {
              reference_images: imageReferences.map(
                (imageReference) => imageReference.base64Image
              ),
            }),
          ...(imagesLLMPopupType === "edit-mask" && {
            imageMask: actualMaskBase64 ?? "",
          }),
        },
        {
          quality,
          moderation,
          sampleCount: parseInt(imageSamples),
          size,
        }
      );
    },
    onSettled: () => {
      setImagesLLMPopupState("idle");
    },
    onSuccess: (data) => {
      setImagesLLMPopupState("uploading");

      setImagesLLMPredictions(data.data);
    },
    onError(error) {
      setImagesLLMPopupError(error);
    },
  });

  React.useEffect(() => {
    if (imagesLLMPopupType) {
      setPrompt("");
      setSize("1024x1024");
      setImagesLLMPopupError(null);
      setImagesLLMPopupState("idle");
    }
  }, [imagesLLMPopupType, setImagesLLMPopupError, setImagesLLMPopupState]);

  React.useEffect(() => {
    if (imagesLLMPopupVisible) {
      setPrompt("");
      setSize("1024x1024");
      setImagesLLMPopupError(null);
      setImagesLLMPopupState("idle");
    }
  }, [imagesLLMPopupVisible, setImagesLLMPopupError, setImagesLLMPopupState]);

  const handlePromptChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(event.target.value);
    },
    []
  );

  const buttonText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "generating":
        if (imagesLLMPopupType === "create") {
          return "Generating";
        }
        if (["edit-prompt", "edit-mask"].includes(imagesLLMPopupType)) {
          return "Editing";
        }
      default:
        if (imagesLLMPopupType === "create") {
          return "Generate";
        }
        if (["edit-prompt", "edit-mask"].includes(imagesLLMPopupType)) {
          return "Edit";
        }
    }
  }, [imagesLLMPopupState, imagesLLMPopupType]);

  const loadingText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "generating":
        if (imagesLLMPopupType === "create") {
          return "Generating Image";
        }
        if (["edit-prompt", "edit-mask"].includes(imagesLLMPopupType)) {
          return "Editing image";
        }
    }
  }, [imagesLLMPopupState, imagesLLMPopupType]);

  const loadingSubText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "generating":
        if (imagesLLMPopupType === "create") {
          return "Generation can take a while, please be patient.";
        }
        if (["edit-prompt", "edit-mask"].includes(imagesLLMPopupType)) {
          return "Edition can take a while, please be patient.";
        }
    }
  }, [imagesLLMPopupState, imagesLLMPopupType]);

  if (!imagesLLMPopupVisible) {
    return null;
  }

  return (
    <>
      <div className="absolute bottom-0 top-0 left-0 min-w-[320px] pointer-events-none">
        <div className="w-full h-full max-h-[calc(100vh)] flex flex-col justify-center items-end bg-white text-black border-r border-[#c9c9c9] ">
          <div className="flex justify-between items-center w-full px-[24px] py-[29px] font-inter font-light text-[24px] uppercase border-b border-[#c9c9c9] pointer-events-auto">
            <div>
              {imagesLLMPopupType === "create" && "Create an Image"}
              {imagesLLMPopupType === "edit-prompt" &&
                "Edit Image with a Prompt"}
              {imagesLLMPopupType === "edit-mask" && "Edit Image with a Mask"}
            </div>
            <button
              className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
              onClick={() => {
                setPrompt("");
                setSize("1024x1024");
                setImagesLLMPopupError(null);
                setImagesLLMPopupVisible(false);
              }}
            >
              <X size={16} strokeWidth={1} />
            </button>
          </div>
          <div
            className={cn(
              "max-h-[calc(100vh-32px)] h-full flex flex-col gap-5 p-5 pointer-events-auto  overflow-auto"
            )}
          >
            <div className="min-w-[420px] max-w-[420px] flex flex-col gap-2 justify-center items-start bg-white text-black">
              {["edit-prompt"].includes(imagesLLMPopupType) &&
                imagesLLMPopupImageBase64 && (
                  <div className="w-full h-[400px] bg-white aspect-square border border-[#c9c9c9] mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagesLLMPopupImageBase64}
                      alt="Image to edit miniature feedback"
                      className="w-full h-full bg-transparent object-contain"
                    />
                  </div>
                )}
              {["edit-mask"].includes(imagesLLMPopupType) &&
                imagesLLMPopupImageBase64 && (
                  <div className="w-full grid grid-cols-1 gap-1 justify-between items-center">
                    <div className="relative w-full h-[400px] bg-white aspect-square border border-[#c9c9c9] mb-4">
                      {!actualMaskBase64UI && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagesLLMPopupImageBase64}
                            alt="Image to edit miniature feedback"
                            className="w-full h-full bg-transparent object-contain"
                          />
                        </>
                      )}
                      {actualMaskBase64UI && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={actualMaskBase64UI}
                            alt="Mask to use miniature feedback"
                            className="absolute top-0 w-full h-full bg-transparent object-contain"
                          />
                        </>
                      )}
                      {!actualMaskBase64UI && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center font-inter text-xs">
                          <div className="bg-white px-3 py-2">
                            No mask defined
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              {["edit-prompt"].includes(imagesLLMPopupType) &&
                imageReferences &&
                imageReferences.length > 0 && (
                  <>
                    <div className="font-inter text-xs">Reference images:</div>
                    <div className="grid grid-cols-2 gap-5 justify-between items-center mb-4">
                      {imageReferences.map(
                        (imageReference: ImageReference, index: number) => (
                          <div
                            key={index}
                            className="relative w-full h-[200px] bg-white aspect-square border border-[#c9c9c9] mb-4"
                          >
                            <div className="absolute top-0 right-0 bg-white/75 pointer-cursor">
                              <button
                                className="w-[40px] h-[40px] flex justify-center items-center bg-white/75 cursor-pointer"
                                onClick={() => {
                                  let newReferences: ImageReference[] = [];
                                  if (imageReferences) {
                                    newReferences = [...imageReferences];
                                  }

                                  newReferences = newReferences.filter(
                                    (_, refIndex) => index !== refIndex
                                  );

                                  setImagesLLMReferences(newReferences);
                                }}
                              >
                                <X className="px-2" size={40} strokeWidth={1} />
                              </button>
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageReference.base64Image}
                              alt={imageReference.description}
                              className="w-full h-full bg-transparent object-contain"
                            />
                            <div className="font-inter text-xs mt-1">
                              Reference Id: {index + 1}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              <div className="font-inter text-xs">Prompt:</div>
              <Textarea
                className="rounded-none !border-black !shadow-none resize-none"
                value={prompt}
                disabled={mutationGenerate.isPending}
                onFocus={() => {
                  window.weaveOnFieldFocus = true;
                }}
                onBlurCapture={() => {
                  window.weaveOnFieldFocus = false;
                }}
                onChange={handlePromptChange}
                placeholder="Example: generate a model with a kaki dress."
              />
              <div className="w-full flex gap-3 justify-end items-center my-4 mb-0">
                <div className="w-full flex gap-5 justify-between items-center font-inter text-xs">
                  <div className="w-full grid grid-cols-2 gap-x-3 gap-y-2 justify-start items-center">
                    <div className="font-inter text-xs">Moderation</div>
                    <div className="w-full flex justify-end items-center">
                      <Select
                        value={moderation}
                        onValueChange={(value) =>
                          setModeration(value as ImageModeration)
                        }
                        disabled={mutationGenerate.isPending}
                      >
                        <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                          <SelectValue placeholder="Moderation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              className="font-inter text-xs"
                              value="low"
                            >
                              Low
                            </SelectItem>
                            <SelectItem
                              className="font-inter text-xs"
                              value="auto"
                            >
                              Auto
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                    <div className="font-inter text-xs">Quality</div>
                    <div className="w-full flex justify-end items-center">
                      <Select
                        value={quality}
                        onValueChange={(value) =>
                          setQuality(value as ImageQuality)
                        }
                        disabled={mutationGenerate.isPending}
                      >
                        <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              className="font-inter text-xs"
                              value="low"
                            >
                              Low
                            </SelectItem>
                            <SelectItem
                              className="font-inter text-xs"
                              value="medium"
                            >
                              Medium
                            </SelectItem>
                            <SelectItem
                              className="font-inter text-xs"
                              value="high"
                            >
                              High
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                    <div className="font-inter text-xs">
                      Aspect Ratio (Size)
                    </div>
                    <div className="w-full flex justify-end items-center">
                      <Select
                        value={size}
                        onValueChange={(value) => setSize(value as ImageSize)}
                        disabled={mutationGenerate.isPending}
                      >
                        <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              className="font-inter text-xs"
                              value="1024x1024"
                            >
                              Squared (1024x1024)
                            </SelectItem>
                            <SelectItem
                              className="font-inter text-xs"
                              value="1024x1536"
                            >
                              Portrait (1024x1536)
                            </SelectItem>
                            <SelectItem
                              className="font-inter text-xs"
                              value="1536x1024"
                            >
                              Landscape (1536x1024)
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                    <div className="font-inter text-xs">Samples</div>
                    <div className="w-full flex justify-end items-center">
                      <Select
                        value={imageSamples}
                        onValueChange={setImageSamples}
                        disabled={mutationGenerate.isPending}
                      >
                        <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                          <SelectValue placeholder="Amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              value="1"
                              className="font-inter text-xs"
                            >
                              1
                            </SelectItem>
                            <SelectItem
                              value="2"
                              className="font-inter text-xs"
                            >
                              2
                            </SelectItem>
                            <SelectItem
                              value="3"
                              className="font-inter text-xs"
                            >
                              3
                            </SelectItem>
                            <SelectItem
                              value="4"
                              className="font-inter text-xs"
                            >
                              4
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              {imagesLLMPopupError && (
                <div className="font-inter text-xs text-[#cc0000] mt-4">
                  {imagesLLMPopupType === "create" &&
                    "Failed to generate image."}
                  {["edit-prompt", "edit-mask"].includes(imagesLLMPopupType) &&
                    "Failed to edit image."}
                </div>
              )}
            </div>
          </div>

          <div className="pointer-events-auto w-full flex p-5 gap-2 justify-end items-center border-t border-[#c9c9c9]">
            <div className="w-full flex gap-5 justify-between items-center">
              <Button
                variant={"secondary"}
                className="uppercase cursor-pointer font-inter rounded-none"
                onClick={async () => {
                  setPrompt("");
                  setSize("1024x1024");
                  setImagesLLMPopupError(null);
                  setImagesLLMPopupVisible(false);
                }}
              >
                Close
              </Button>
              <Button
                className="uppercase cursor-pointer font-inter rounded-none"
                disabled={
                  (["create"].includes(imagesLLMPopupType) &&
                    (mutationGenerate.isPending ||
                      !prompt ||
                      prompt.length === 0)) ||
                  (["edit-prompt"].includes(imagesLLMPopupType) &&
                    (mutationGenerate.isPending ||
                      !prompt ||
                      prompt.length === 0)) ||
                  (["edit-mask"].includes(imagesLLMPopupType) &&
                    (mutationGenerate.isPending ||
                      !prompt ||
                      prompt.length === 0 ||
                      !actualMaskBase64 ||
                      actualMaskBase64.length === 0))
                }
                onClick={async () => {
                  setImagesLLMPopupError(null);
                  if (imagesLLMPopupType === "create") {
                    mutationGenerate.mutate();
                  }
                  if (imagesLLMPopupType === "edit-prompt") {
                    mutationEdit.mutate();
                  }
                  if (imagesLLMPopupType === "edit-mask") {
                    mutationEdit.mutate();
                  }
                }}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {!["idle", "uploading"].includes(imagesLLMPopupState) && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/25 z-[100] flex justify-center items-center">
          <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
            <Logo kind="large" variant="no-text" />
            <div className="flex flex-col gap-1 justify-center items-center">
              <div className="font-inter text-base">{loadingText}</div>
              <div className="font-inter text-sm">{loadingSubText}</div>
            </div>
            <ScaleLoader className="my-2" />
          </div>
        </div>
      )}
    </>
  );
}
