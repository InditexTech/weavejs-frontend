// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import Konva from "konva";
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
import {
  ImageReference,
  LLMGeneratorType,
  useIACapabilities,
} from "@/store/ia";
import { cn } from "@/lib/utils";
import { useGenerateMask } from "../hooks/use-generate-mask";
import { Image as ImageIcon, X } from "lucide-react";
import { ImageModeration, ImageQuality, ImageSize } from "@/api/types";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useWeave } from "@inditextech/weave-react";
import { MaskEraserToolAction } from "@/components/actions/mask-eraser-tool/mask-eraser-tool";
import { WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";

export function LLMGenerationV2Popup() {
  useKeyboardHandler();

  const [prompt, setPrompt] = React.useState<string>("");
  const [imageSamples, setImageSamples] = React.useState<string>("4");
  const [moderation, setModeration] = React.useState<ImageModeration>("auto");
  const [quality, setQuality] = React.useState<ImageQuality>("medium");
  const [size, setSize] = React.useState<ImageSize>("1024x1024");

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const setImagesLLMPopupError = useIACapabilities(
    (state) => state.setImagesLLMPopupError
  );
  const selectedNodes = useIACapabilities((state) => state.llmPopup.selected);
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
  const setImagesLLMPopupType = useIACapabilities(
    (state) => state.setImagesLLMPopupType
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
  const setImagesLLMReferencesVisible = useIACapabilities(
    (state) => state.setImagesLLMReferencesVisible
  );
  const setSelectedMasks = useIACapabilities((state) => state.setSelectedMasks);

  const [actualMaskBase64, actualMaskBase64UI] = useGenerateMask();

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const handleOnMaskAdded = ({ nodeId }: { nodeId: string }) => {
      setSelectedMasks((prev) => {
        const newMasksSelected = new Set([...prev]);
        newMasksSelected.add(nodeId);
        return Array.from(newMasksSelected);
      });
    };

    const handleOnMaskRemoved = ({ nodeId }: { nodeId: string }) => {
      setSelectedMasks((prev) => {
        let newMasksSelected = [...prev];
        newMasksSelected = newMasksSelected.filter((mask) => mask !== nodeId);
        return newMasksSelected;
      });
    };

    instance.addEventListener("onMaskAdded", handleOnMaskAdded);
    instance.addEventListener("onMaskRemoved", handleOnMaskRemoved);

    return () => {
      instance.removeEventListener("onNodeAdded", handleOnMaskAdded);
      instance.removeEventListener("onNodeRemoved", handleOnMaskRemoved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const selectionPlugin =
      instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");

    if (selectionPlugin && selectedNodes && selectedNodes.length > 0) {
      selectionPlugin.setSelectedNodes(selectedNodes);
      instance.triggerAction("fitToSelectionTool", {
        previousAction: undefined,
      });
    }
  }, [instance, selectedNodes, imagesLLMPopupType]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    instance.triggerAction("fitToSelectionTool", {
      previousAction: undefined,
    });
  }, [instance, imagesLLMPopupType]);

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
    if (!instance) {
      return;
    }

    const stage: Konva.Stage = instance.getStage();

    if (imagesLLMPopupVisible) {
      stage.allowActions(["maskTool", "fuzzyMaskTool"]);
      stage.allowSelectNodes(["mask", "fuzzy-mask"]);
      stage.allowSelection(true);
      setPrompt("");
      setSize("1024x1024");
      setImagesLLMPopupError(null);
      setImagesLLMPopupState("idle");
    } else {
      stage.allowActions([]);
      stage.allowSelectNodes([]);
      stage.allowSelection(false);
    }
  }, [
    instance,
    imagesLLMPopupVisible,
    setImagesLLMPopupError,
    setImagesLLMPopupState,
  ]);

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
        if (
          ["edit-prompt", "edit-variation", "edit-mask"].includes(
            imagesLLMPopupType
          )
        ) {
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
        if (
          ["edit-prompt", "edit-variation", "edit-mask"].includes(
            imagesLLMPopupType
          )
        ) {
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
        if (
          ["edit-prompt", "edit-variation", "edit-mask"].includes(
            imagesLLMPopupType
          )
        ) {
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
        <div className="w-full h-full max-h-[calc(100dvh)] flex flex-col justify-center items-end bg-white text-black border-l-0 border-r border-[#c9c9c9] ">
          <div className="flex justify-between items-center w-full px-[24px] py-[29px] font-inter font-light text-[24px] uppercase border-b border-[#c9c9c9] pointer-events-auto">
            <div>
              {imagesLLMPopupType === "create" && "Create an Image with AI"}
              {imagesLLMPopupType === "edit-prompt" && "Edit with AI"}
              {imagesLLMPopupType === "edit-mask" && "Edit with AI"}
              {imagesLLMPopupType === "edit-variation" && "Edit with AI"}
            </div>
            <button
              className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
              onClick={() => {
                if (!instance) {
                  return;
                }

                const maskEraserTool =
                  instance.getActionHandler<MaskEraserToolAction>(
                    "maskEraserTool"
                  );
                if (maskEraserTool) {
                  maskEraserTool.removeMaskNodes();
                }

                setPrompt("");
                setSize("1024x1024");
                setImagesLLMPopupError(null);
                setImagesLLMPopupVisible(false);

                instance.triggerAction("selectionTool");
              }}
            >
              <X size={16} strokeWidth={1} />
            </button>
          </div>
          {imagesLLMPopupVisible && imagesLLMPopupType !== "create" && (
            <Tabs
              value={imagesLLMPopupType}
              onValueChange={(value) => {
                if (!instance) {
                  return;
                }

                const maskEraserTool =
                  instance.getActionHandler<MaskEraserToolAction>(
                    "maskEraserTool"
                  );
                if (maskEraserTool) {
                  maskEraserTool.removeMaskNodes();
                }

                setPrompt("");
                setSize("1024x1024");
                setModeration("auto");
                setQuality("medium");
                setImageSamples("4");
                setImagesLLMReferences([]);
                setImagesLLMPopupError(null);
                setImagesLLMPopupType(value as LLMGeneratorType);
              }}
              className="w-full flex pointer-events-auto pointer-events-auto"
            >
              <TabsList className="relative w-full bg-white px-[20px] py-0 gap-0 flex justify-between items-center">
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#c9c9c9]"></div>
                {/* <div className="font-inter text-black text-sm">Edition mode</div> */}
                <div className="flex gap-0 justify-start items-center z-1">
                  <TabsTrigger value="edit-prompt" asChild>
                    <button
                      className={cn(
                        "px-3 py-2 bg-transparent cursor-pointer border-b border-transparent text-[#5c5c5c] box-content font-inter text-xs uppercase hover:text-black hover:border-b hover:border-black ",
                        {
                          "text-black border-b border-black":
                            imagesLLMPopupType === "edit-prompt",
                        }
                      )}
                    >
                      Prompt
                    </button>
                  </TabsTrigger>
                  <TabsTrigger value="edit-mask" asChild>
                    <button
                      className={cn(
                        "px-3 py-2 bg-transparent cursor-pointer border-b border-transparent text-[#5c5c5c] box-content font-inter text-xs uppercase hover:text-black hover:border-b hover:border-black ",
                        {
                          "text-black border-b border-black":
                            imagesLLMPopupType === "edit-mask",
                        }
                      )}
                    >
                      Mask In-paint
                    </button>
                  </TabsTrigger>
                  <TabsTrigger value="edit-variation" asChild>
                    <button
                      className={cn(
                        "px-3 py-2 bg-transparent cursor-pointer border-b border-transparent text-[#5c5c5c] box-content font-inter text-xs uppercase hover:text-black hover:border-b hover:border-black ",
                        {
                          "text-black border-b border-black":
                            imagesLLMPopupType === "edit-variation",
                        }
                      )}
                    >
                      Variations
                    </button>
                  </TabsTrigger>
                </div>
              </TabsList>
            </Tabs>
          )}
          <ScrollArea
            className={cn("w-full", {
              "h-[calc(100dvh-95px-89px)]":
                imagesLLMPopupVisible && imagesLLMPopupType === "create",
              "h-[calc(100dvh-33px-95px-89px)]":
                imagesLLMPopupVisible && imagesLLMPopupType !== "create",
            })}
          >
            <div className={cn("flex flex-col gap-5 p-5 pointer-events-auto")}>
              <div className="min-w-[330px] max-w-[330px] flex flex-col gap-2 justify-center items-start bg-white text-black">
                {["edit-mask", "edit-prompt", "edit-variation"].includes(
                  imagesLLMPopupType
                ) && <div className="font-inter text-xs">Image to edit:</div>}
                {["edit-prompt", "edit-variation"].includes(
                  imagesLLMPopupType
                ) &&
                  imagesLLMPopupImageBase64 && (
                    <div className="w-full h-[330px] bg-white aspect-square border border-[#c9c9c9] mb-4">
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
                      <div className="relative w-full h-[330px] bg-white aspect-square border border-[#c9c9c9] mb-4">
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
                {["edit-variation"].includes(imagesLLMPopupType) && (
                  <>
                    <div className="font-inter text-xs">Reference images:</div>
                    <ScrollArea className="w-[330px] border border-[#c9c9c9]">
                      <div className="w-full flex gap-2 justify-start items-center p-5">
                        {(!imageReferences ||
                          (imageReferences &&
                            imageReferences.length === 0)) && (
                          <div className="w-full flex gap-1 bg-[#ededed] p-5 justify-center items-center">
                            <ImageIcon size={20} strokeWidth={1} />
                            <span className="font-inter text-xs uppercase">
                              No images references added
                            </span>
                          </div>
                        )}
                        {imageReferences?.map(
                          (imageReference: ImageReference, index: number) => (
                            <div
                              key={index}
                              className="relative bg-white aspect-square border border-[#c9c9c9]"
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
                                  <X
                                    className="px-2"
                                    size={40}
                                    strokeWidth={1}
                                  />
                                </button>
                              </div>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imageReference.base64Image}
                                alt={`Reference ${index + 1}`}
                                className="w-[160px] h-[160px] bg-transparent object-contain"
                              />
                              <div className="w-[160px] font-inter text-center text-xs py-3">
                                Id: {index + 1}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <Button
                      variant="default"
                      disabled={imageReferences?.length === 4}
                      className="w-full uppercase cursor-pointer font-inter rounded-none"
                      onClick={() => {
                        setImagesLLMReferencesVisible(true);
                      }}
                    >
                      Add image references
                    </Button>
                    <div className="font-inter text-xs w-full text-center mb-4 text-[#757575]">
                      maximum 4 reference images
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
                      <div className="flex gap-1 justify-start items-center">
                        <span className="font-inter text-xs">Moderation</span>
                      </div>
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
                          <SelectContent
                            className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                            align="end"
                          >
                            <SelectGroup>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="low"
                              >
                                Low
                              </SelectItem>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="auto"
                              >
                                Auto
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                      <div className="flex gap-1 justify-start items-center">
                        <span className="font-inter text-xs">Quality</span>
                      </div>
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
                          <SelectContent
                            className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                            align="end"
                          >
                            <SelectGroup>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="low"
                              >
                                Low
                              </SelectItem>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="medium"
                              >
                                Medium
                              </SelectItem>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="high"
                              >
                                High
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                      <div className="flex gap-1 justify-start items-center">
                        <span className="font-inter text-xs">
                          Aspect Ratio (Size)
                        </span>
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
                          <SelectContent
                            className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                            align="end"
                          >
                            <SelectGroup>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="1024x1024"
                              >
                                Squared (1024x1024)
                              </SelectItem>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="1024x1536"
                              >
                                Portrait (1024x1536)
                              </SelectItem>
                              <SelectItem
                                className="font-inter text-xs rounded-none"
                                value="1536x1024"
                              >
                                Landscape (1536x1024)
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                      <div className="flex gap-1 justify-start items-center">
                        <span className="font-inter text-xs">Samples</span>
                      </div>
                      <div className="w-full flex justify-end items-center">
                        <Select
                          value={imageSamples}
                          onValueChange={setImageSamples}
                          disabled={mutationGenerate.isPending}
                        >
                          <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                            <SelectValue placeholder="Amount" />
                          </SelectTrigger>
                          <SelectContent
                            className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                            align="end"
                          >
                            <SelectGroup>
                              <SelectItem
                                value="1"
                                className="font-inter text-xs rounded-none"
                              >
                                1
                              </SelectItem>
                              <SelectItem
                                value="2"
                                className="font-inter text-xs rounded-none"
                              >
                                2
                              </SelectItem>
                              <SelectItem
                                value="3"
                                className="font-inter text-xs rounded-none"
                              >
                                3
                              </SelectItem>
                              <SelectItem
                                value="4"
                                className="font-inter text-xs rounded-none"
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
                    {["edit-prompt", "edit-mask"].includes(
                      imagesLLMPopupType
                    ) && "Failed to edit image."}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="pointer-events-auto w-full flex p-5 gap-2 justify-end items-center border-t border-[#c9c9c9]">
            <div className="w-full flex gap-5 justify-end items-center">
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
                  (["edit-variation"].includes(imagesLLMPopupType) &&
                    (mutationGenerate.isPending ||
                      !prompt ||
                      prompt.length === 0 ||
                      !imageReferences ||
                      (imageReferences && imageReferences.length === 0))) ||
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
                  if (imagesLLMPopupType === "edit-variation") {
                    mutationEdit.mutate();
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
              <div className="font-inter text-base uppercase">
                {loadingText}
              </div>
              <div className="font-inter text-sm">{loadingSubText}</div>
            </div>
            <ScaleLoader className="my-2" />
          </div>
        </div>
      )}
    </>
  );
}
