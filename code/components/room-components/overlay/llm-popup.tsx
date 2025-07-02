// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { postGenerateImage } from "@/api/post-generate-image";
import { postEditImage } from "@/api/post-edit-image";
import { Logo } from "@/components/utils/logo";
import { ImageReference, useIACapabilities } from "@/store/ia";
import { cn } from "@/lib/utils";
import { InputNumber } from "../inputs/input-number";
import { useGenerateMask } from "../hooks/use-generate-mask";
import { X } from "lucide-react";

const LLM_MODEL = "imagen-4.0-generate-preview-06-06";

export function LLMGenerationPopup() {
  useKeyboardHandler();

  const [prompt, setPrompt] = React.useState<string>("");
  const [negativePrompt, setNegativePrompt] = React.useState<string>("");
  const [imageSamples, setImageSamples] = React.useState<string>("4");
  const [aspectRatio, setAspectRatio] = React.useState<string>("1:1");
  const [editionMode, setEditionMode] = React.useState<string>(
    "EDIT_MODE_INPAINT_INSERTION"
  );
  const [seed, setSeed] = React.useState<string>("42");
  const [baseSteps, setBaseSteps] = React.useState<string>("75");
  const [guidanceStrength, setGuidanceStrength] = React.useState<string>("60");

  const room = useCollaborationRoom((state) => state.room);
  const setImagesLLMPopupError = useIACapabilities(
    (state) => state.setImagesLLMPopupError
  );
  const imageReferences = useIACapabilities((state) => state.references.images);
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
          model: LLM_MODEL,
          prompt: prompt,
          ...(imageReferences &&
            imageReferences.length > 0 && {
              reference_images: imageReferences?.map((imageReference) => ({
                ...imageReference,
                base64Image: imageReference.base64Image.split(",")[1],
              })),
            }),
        },
        {
          aspectRatio,
          negativePrompt,
          sampleCount: parseInt(imageSamples),
        }
      );
    },
    onSettled: () => {
      setImagesLLMPopupState("idle");
    },
    onSuccess: (data) => {
      setImagesLLMPopupState("uploading");

      setImagesLLMPredictions(data.predictions);
    },
    onError(error) {
      setImagesLLMPopupError(error);
    },
  });

  const mutationEdit = useMutation({
    mutationFn: async () => {
      setImagesLLMPopupState("generating");

      return await postEditImage(
        {
          roomId: room ?? "",
          prompt,
          image: (imagesLLMPopupImageBase64 ?? "").split(",")[1],
          ...(imagesLLMPopupType === "edit-mask" && {
            imageMask: (actualMaskBase64 ?? "").split(",")[1],
          }),
        },
        {
          negativePrompt,
          seed: parseFloat(seed),
          editMode: editionMode,
          sampleCount: parseInt(imageSamples),
          baseSteps: parseFloat(baseSteps),
          guidanceStrength: parseFloat(guidanceStrength),
        }
      );
    },
    onSettled: () => {
      setImagesLLMPopupState("idle");
    },
    onSuccess: (data) => {
      setImagesLLMPopupState("uploading");

      setImagesLLMPredictions(data.predictions);
    },
    onError(error) {
      setImagesLLMPopupError(error);
    },
  });

  React.useEffect(() => {
    if (imagesLLMPopupVisible) {
      setPrompt("");
      setNegativePrompt("");
      setAspectRatio("1:1");
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

  const handleNegativePromptChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNegativePrompt(event.target.value);
    },
    []
  );

  const buttonText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "generating":
        if (imagesLLMPopupType === "create") {
          return "Generating...";
        }
        if (["edit-prompt", "edit-mask"].includes(imagesLLMPopupType)) {
          return "Editing...";
        }
      case "uploading":
        return "Uploading...";
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
          return "Generating image...";
        }
        if (["edit-prompt", "edit-mask"].includes(imagesLLMPopupType)) {
          return "Editing image...";
        }
      case "uploading":
        return "Uploading image...";
    }
  }, [imagesLLMPopupState, imagesLLMPopupType]);

  if (!imagesLLMPopupVisible) {
    return null;
  }

  return (
    <>
      <div className="absolute bottom-[16px] top-[16px] left-[16px] min-w-[320px] pointer-events-none">
        <div className="w-full h-full max-h-[calc(100dvh-32px)] flex flex-col justify-center items-end bg-white text-black border border-[#c9c9c9] ">
          <div className="w-full p-5 font-inter text-xl border-b border-[#c9c9c9]">
            {imagesLLMPopupType === "create" && "Create an Image"}
            {imagesLLMPopupType === "edit-prompt" && "Edit Image with a Prompt"}
            {imagesLLMPopupType === "edit-mask" && "Edit Image with a Mask"}
          </div>
          <div
            className={cn(
              "max-h-[calc(100dvh-32px)] h-full flex flex-col gap-5 p-5 pointer-events-auto  overflow-scroll"
            )}
          >
            <div className="min-w-[420px] max-w-[420px] flex flex-col gap-2 justify-center items-start bg-white text-black">
              {["edit-prompt"].includes(imagesLLMPopupType) &&
                imagesLLMPopupImageBase64 && (
                  <div className="w-full h-[200px] bg-white aspect-square border border-[#c9c9c9] mb-4">
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
                    <div className="w-full h-[200px] bg-white aspect-square border border-[#c9c9c9] mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagesLLMPopupImageBase64}
                        alt="Image to edit miniature feedback"
                        className="w-full h-full bg-transparent object-contain"
                      />
                    </div>
                    <div className="w-full h-[200px] bg-white aspect-square border border-[#c9c9c9] mb-4">
                      <div className="relative w-full h-full flex gap-2 justify-center items-center">
                        {actualMaskBase64UI && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={actualMaskBase64UI}
                              alt="Mask to use miniature feedback"
                              className="w-full h-full bg-transparent object-contain"
                            />
                          </>
                        )}
                        {!actualMaskBase64UI && (
                          <div className="font-inter text-sm">
                            No mask defined
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              {["create"].includes(imagesLLMPopupType) && imageReferences && (
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
                            alt={`Reference ${index + 1}`}
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
              />{" "}
              <div className="font-inter text-xs">Negative prompt:</div>
              <Textarea
                className="rounded-none !border-black !shadow-none resize-none"
                value={negativePrompt}
                disabled={mutationGenerate.isPending}
                onFocus={() => {
                  window.weaveOnFieldFocus = true;
                }}
                onBlurCapture={() => {
                  window.weaveOnFieldFocus = false;
                }}
                onChange={handleNegativePromptChange}
                placeholder="Example: don't change the color of the shirt."
              />
              <div className="w-full flex gap-3 justify-end items-center my-4 mb-0">
                <div className="w-full flex gap-5 justify-between items-center font-inter text-xs">
                  <div className="w-full grid grid-cols-2 gap-x-3 gap-y-2 justify-start items-center">
                    {["edit-mask"].includes(imagesLLMPopupType) && (
                      <>
                        <div className="font-inter text-xs">Edition Mode</div>
                        <div className="w-full flex justify-end items-center">
                          <Select
                            value={editionMode}
                            onValueChange={setEditionMode}
                          >
                            <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                              <SelectValue placeholder="Edition mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem
                                  className="font-inter text-xs"
                                  value="EDIT_MODE_INPAINT_INSERTION"
                                >
                                  Insertion
                                </SelectItem>
                                <SelectItem
                                  className="font-inter text-xs"
                                  value="EDIT_MODE_INPAINT_REMOVAL"
                                >
                                  Removal
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                        <div className="font-inter text-xs">Seed</div>
                        <div className="w-full flex justify-end items-center">
                          <InputNumber
                            className="!w-[60px] !h-[30px] !border-black !font-inter !text-xs !text-black"
                            value={parseFloat(seed)}
                            onChange={(value) => {
                              setSeed(`${value}`);
                            }}
                          />
                        </div>
                        <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                        <div className="font-inter text-xs">Steps</div>
                        <div className="w-full flex justify-end items-center">
                          <InputNumber
                            className="!w-[60px] !h-[30px] !border-black !font-inter !text-xs !text-black"
                            max={100}
                            min={0}
                            value={parseFloat(baseSteps)}
                            onChange={(value) => {
                              setBaseSteps(`${value}`);
                            }}
                          />
                        </div>
                      </>
                    )}
                    {["edit-prompt", "edit-mask"].includes(
                      imagesLLMPopupType
                    ) && (
                      <>
                        <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                        <div className="font-inter text-xs">Guidance Scale</div>
                        <div className="w-full flex justify-end items-center">
                          <InputNumber
                            className="!w-[60px] !h-[30px] !border-black !font-inter !text-xs !text-black"
                            max={500}
                            min={0}
                            value={parseFloat(guidanceStrength)}
                            onChange={(value) => {
                              setGuidanceStrength(`${value}`);
                            }}
                          />
                        </div>
                      </>
                    )}
                    {imagesLLMPopupType === "create" && (
                      <>
                        <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                        <div className="font-inter text-xs">Aspect ratio</div>
                        <div className="w-full flex justify-end items-center">
                          <Select
                            value={aspectRatio}
                            onValueChange={setAspectRatio}
                          >
                            <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem
                                  className="font-inter text-xs"
                                  value="4:3"
                                >
                                  Landscape (4:3)
                                </SelectItem>
                                <SelectItem
                                  className="font-inter text-xs"
                                  value="3:4"
                                >
                                  Portrait (3:4)
                                </SelectItem>
                                <SelectItem
                                  className="font-inter text-xs"
                                  value="16:9"
                                >
                                  Landscape (16:9)
                                </SelectItem>
                                <SelectItem
                                  className="font-inter text-xs"
                                  value="9:16"
                                >
                                  Portrait (9:16)
                                </SelectItem>
                                <SelectItem
                                  className="font-inter text-xs"
                                  value="1:1"
                                >
                                  Squared (1:1)
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                    <div className="font-inter text-xs">Samples</div>
                    <div className="w-full flex justify-end items-center">
                      <Select
                        value={imageSamples}
                        onValueChange={setImageSamples}
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
                  setAspectRatio("1:1");
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
      {imagesLLMPopupState !== "idle" && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/25 z-[100] flex justify-center items-center">
          <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
            <Logo kind="large" variant="no-text" />
            <div className="font-inter text-base">{loadingText}</div>
          </div>
        </div>
      )}
    </>
  );
}
