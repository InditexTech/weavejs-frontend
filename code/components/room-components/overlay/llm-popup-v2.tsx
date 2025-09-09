// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import Konva from "konva";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScaleLoader } from "react-spinners";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { postGenerateImageV2 } from "@/api/v3/post-generate-image";
import { postEditImageV2 } from "@/api/v3/post-edit-image";
import { Logo } from "@/components/utils/logo";
import {
  ImageReference,
  LLMGeneratorType,
  useIACapabilitiesV2,
} from "@/store/ia-v2";
import { cn } from "@/lib/utils";
import { useGenerateMaskV2 } from "../hooks/use-generate-mask-v2";
import { ImageOff, X } from "lucide-react";
import {
  ImageModel,
  ImageModeration,
  ImageQuality,
  ImageSize,
} from "@/api/types";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useWeave } from "@inditextech/weave-react";
import { MaskEraserToolAction } from "@/components/actions/mask-eraser-tool/mask-eraser-tool";
import {
  WEAVE_STAGE_DEFAULT_MODE,
  WeaveNodesSelectionPlugin,
} from "@inditextech/weave-sdk";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";

export function LLMGenerationPopupV2() {
  useKeyboardHandler();

  const [modelToUse, setModelToUse] =
    React.useState<ImageModel>("openai/gpt-image-1");
  const [promptGenerate, setPromptGenerate] = React.useState<string>("");
  const [promptEdit, setPromptEdit] = React.useState<Record<string, string>>(
    {}
  );
  const [imageSamples, setImageSamples] = React.useState<string>("4");
  const [moderation, setModeration] = React.useState<ImageModeration>("auto");
  const [quality, setQuality] = React.useState<ImageQuality>("medium");
  const [size, setSize] = React.useState<ImageSize>("1024x1024");

  const instance = useWeave((state) => state.instance);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const setImagesLLMPopupError = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupError
  );
  const selectedNodes = useIACapabilitiesV2((state) => state.llmPopup.selected);
  const imageReferences = useIACapabilitiesV2(
    (state) => state.references.images
  );
  const imagesLLMPopupType = useIACapabilitiesV2(
    (state) => state.llmPopup.type
  );
  const imagesLLMPopupVisible = useIACapabilitiesV2(
    (state) => state.llmPopup.visible
  );
  const imagesLLMPopupImageSelected = useIACapabilitiesV2(
    (state) => state.llmPopup.selected
  );
  const imagesLLMPopupImageBase64 = useIACapabilitiesV2(
    (state) => state.llmPopup.imageBase64
  );
  const imagesLLMPopupState = useIACapabilitiesV2(
    (state) => state.llmPopup.state
  );
  const setImagesLLMPopupType = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupState = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupState
  );
  const setImagesLLMPopupVisible = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupVisible
  );
  const setImagesLLMPredictions = useIACapabilitiesV2(
    (state) => state.setImagesLLMPredictions
  );
  const setImagesLLMReferences = useIACapabilitiesV2(
    (state) => state.setImagesLLMReferences
  );
  const setSelectedMasks = useIACapabilitiesV2(
    (state) => state.setSelectedMasks
  );
  const setImagesReferences = useIACapabilitiesV2(
    (state) => state.setImagesLLMReferences
  );
  const setImagesLLMReferencesVisible = useIACapabilitiesV2(
    (state) => state.setImagesLLMReferencesVisible
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
  );

  const [actualMaskBase64, actualMaskBase64UI] = useGenerateMaskV2();

  React.useEffect(() => {
    if (modelToUse === "gemini/gemini-2.5-flash-image-preview") {
      setImageSamples("1");
    }
    if (modelToUse === "openai/gpt-image-1") {
      setImageSamples("4");
    }
  }, [modelToUse]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (imagesLLMPopupVisible) {
      (instance.getStage() as Konva.Stage).mode("llmPopup");
      setTimeout(() => {
        const textArea = document.getElementById(
          "llm-prompt-textarea"
        ) as HTMLTextAreaElement;

        if (textArea) {
          textArea.focus();
          const length = textArea.value.length;
          textArea.setSelectionRange(length, length);
        }
      }, 100);
    } else {
      (instance.getStage() as Konva.Stage).mode(WEAVE_STAGE_DEFAULT_MODE);
    }
  }, [instance, imagesLLMPopupVisible]);

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

  const handleClose = React.useCallback(() => {
    if (!instance) {
      return;
    }

    const maskEraserTool =
      instance.getActionHandler<MaskEraserToolAction>("maskEraserTool");
    if (maskEraserTool) {
      maskEraserTool.removeMaskNodes();
    }

    setImagesLLMReferences([]);
    setImagesLLMPopupError(null);
    setImagesLLMPopupVisible(false);

    instance.triggerAction("selectionTool");
  }, [
    instance,
    setImagesLLMReferences,
    setImagesLLMPopupError,
    setImagesLLMPopupVisible,
  ]);

  const mutationGenerate = useMutation({
    mutationFn: async () => {
      return await postGenerateImageV2(
        {
          userId: user?.name ?? "",
          clientId: clientId ?? "",
          roomId: room ?? "",
          prompt: promptGenerate,
        },
        {
          model: modelToUse,
          quality,
          moderation,
          size,
          sampleCount: parseInt(imageSamples),
        }
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting images generation...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onSuccess: (data) => {
      sidebarToggle(SIDEBAR_ELEMENTS.images);

      setImagesLLMPredictions(data.data);

      handleClose();
    },
    onError(error) {
      toast.error("Error requesting images generation.");
      setImagesLLMPopupError(error);
    },
  });

  const mutationEdit = useMutation({
    mutationFn: async () => {
      if (!imagesLLMPopupImageBase64) {
        throw new Error("No reference image");
      }

      if (imagesLLMPopupType === "edit-mask" && !actualMaskBase64) {
        throw new Error("No mask defined");
      }

      return await postEditImageV2(
        {
          userId: user?.name ?? "",
          clientId: clientId ?? "",
          roomId: room ?? "",
          prompt:
            promptEdit[imagesLLMPopupImageSelected?.[0].getAttrs().id ?? ""] ??
            "",
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
    onMutate: () => {
      const toastId = toast.loading("Requesting images generation...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onSuccess: (data) => {
      sidebarToggle(SIDEBAR_ELEMENTS.images);

      setImagesLLMPredictions(data.data);

      handleClose();
    },
    onError(error) {
      setImagesLLMPopupError(error);
    },
  });

  React.useEffect(() => {
    if (imagesLLMPopupType) {
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
      if (imagesLLMPopupType === "create") {
        setPromptGenerate(event.target.value);
      } else {
        const newPromptEdit = { ...promptEdit };
        if (imagesLLMPopupImageSelected) {
          newPromptEdit[imagesLLMPopupImageSelected?.[0].getAttrs().id ?? ""] =
            event.target.value;
        }
        setPromptEdit(newPromptEdit);
      }
    },
    [imagesLLMPopupImageSelected, promptEdit, imagesLLMPopupType]
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

  const prompt = React.useMemo(() => {
    if (imagesLLMPopupType === "create") {
      return promptGenerate;
    }
    if (imagesLLMPopupType === "edit-prompt") {
      return (
        promptEdit[imagesLLMPopupImageSelected?.[0].getAttrs().id ?? ""] ?? ""
      );
    }
    return "";
  }, [
    promptGenerate,
    promptEdit,
    imagesLLMPopupImageSelected,
    imagesLLMPopupType,
  ]);

  if (!imagesLLMPopupVisible) {
    return null;
  }

  return (
    <>
      <div className="absolute bottom-[16px] left-[16px] min-w-[370px] pointer-events-none flex justify-center items-center">
        <div className="w-full h-full max-h-[calc(100dvh-72px-48px)] flex flex-col justify-center items-end bg-white text-black border border-[#c9c9c9] ">
          <div className="flex justify-between items-center w-full px-[24px] py-[29px] font-inter font-light text-[24px] uppercase border-b border-[#c9c9c9] pointer-events-auto">
            <div>
              {imagesLLMPopupType === "create" && "Generate Images"}
              {imagesLLMPopupType === "edit-prompt" && "Edit Image"}
              {imagesLLMPopupType === "edit-mask" && "Edit Image"}
              {imagesLLMPopupType === "edit-variation" && "Edit Image"}
            </div>
            <button
              className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
              onClick={() => handleClose()}
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

                setImagesLLMReferences([]);
                setImagesLLMPopupError(null);
                setImagesLLMPopupType(value as LLMGeneratorType);
              }}
              className="w-full flex pointer-events-auto"
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
            className={cn("w-full pointer-events-auto", {
              "h-[calc(100dvh-72px-48px-95px-89px)]":
                imagesLLMPopupVisible && imagesLLMPopupType === "create",
              "h-[calc(100dvh-72px-48px-33px-95px-89px)]":
                imagesLLMPopupVisible && imagesLLMPopupType !== "create",
            })}
          >
            {["edit-prompt", "edit-variation"].includes(imagesLLMPopupType) &&
              imagesLLMPopupImageBase64 && (
                <div className="w-full h-[330px] bg-white aspect-square border-b border-[#c9c9c9]">
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
                  <div className="relative w-full h-[330px] bg-white aspect-square border-b border-[#c9c9c9]">
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
              <div className="w-full max-w-[370px] flex flex-col pointer-events-auto">
                <div className="w-full flex flex-col border-b border-[#c9c9c9]">
                  <div className="w-full p-5">
                    <Button
                      className="w-full uppercase cursor-pointer font-inter rounded-none"
                      onClick={() => {
                        setImagesLLMReferencesVisible(true);
                      }}
                    >
                      MANAGE IMAGES REFERENCES
                    </Button>
                  </div>
                  <ScrollArea className="w-full h-[116px] border-t border-[#c9c9c9]">
                    <div className="w-full flex flex-1 gap-2 justify-start items-center p-2">
                      {(!imageReferences ||
                        (imageReferences && imageReferences.length === 0)) && (
                        <div className="w-[calc(100%)] h-[calc(100px)] flex gap-3 bg-[#ededed] p-3 justify-center items-center">
                          <ImageOff size={32} strokeWidth={1} />
                          <div className="font-inter text-xs text-left">
                            <span className="text-xs uppercase">
                              No references defined
                            </span>
                          </div>
                        </div>
                      )}
                      {imageReferences?.map(
                        (imageReference: ImageReference, index: number) => (
                          <div
                            key={index}
                            className="w-[calc(100px)] h-[calc(100px)] relative bg-white aspect-square border border-[#c9c9c9]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageReference.base64Image}
                              alt={`Reference ${index + 1}`}
                              className="flex-auto w-[calc(100px)] h-[calc(100px)] bg-transparent object-cover"
                              style={{
                                aspectRatio: `${imageReference.aspectRatio}`,
                              }}
                            />
                            <div className="absolute top-0 left-0 font-inter text-center text-xs">
                              <Badge
                                className="h-[24px] min-w-[24px] rounded-none border-none px-1 font-inter tabular-nums bg-white/75"
                                variant="outline"
                              >
                                {index + 1}
                              </Badge>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </div>
            )}
            <div className={cn("flex flex-col gap-5 p-5 pointer-events-auto")}>
              <div className="min-w-[330px] max-w-[330px] flex flex-col gap-2 justify-center items-start bg-white text-black">
                <div className="font-inter text-xs uppercase">Prompt</div>
                <Textarea
                  id="llm-prompt-textarea"
                  className="rounded-none !border-black !shadow-none resize-none"
                  value={prompt}
                  disabled={
                    mutationGenerate.isPending || mutationEdit.isPending
                  }
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
                        <span className="font-inter text-xs uppercase">
                          Model
                        </span>
                      </div>
                      <div className="w-full flex justify-end items-center">
                        <Select
                          value={modelToUse}
                          onValueChange={(value) =>
                            setModelToUse(value as ImageModel)
                          }
                          disabled={
                            mutationGenerate.isPending || mutationEdit.isPending
                          }
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
                                value="openai/gpt-image-1"
                              >
                                openai/gpt-image-1
                              </SelectItem>
                              {imagesLLMPopupType === "create" && (
                                <SelectItem
                                  className="font-inter text-xs rounded-none"
                                  value="gemini/gemini-2.5-flash-image-preview"
                                >
                                  gemini/gemini-2.5-flash-image-preview
                                </SelectItem>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 h-[1px] bg-[#c9c9c9]"></div>
                      {modelToUse === "openai/gpt-image-1" && (
                        <>
                          <div className="flex gap-1 justify-start items-center">
                            <span className="font-inter text-xs uppercase">
                              Moderation
                            </span>
                          </div>
                          <div className="w-full flex justify-end items-center">
                            <Select
                              value={moderation}
                              onValueChange={(value) =>
                                setModeration(value as ImageModeration)
                              }
                              disabled={
                                mutationGenerate.isPending ||
                                mutationEdit.isPending
                              }
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
                            <span className="font-inter text-xs uppercase">
                              Quality
                            </span>
                          </div>
                          <div className="w-full flex justify-end items-center">
                            <Select
                              value={quality}
                              onValueChange={(value) =>
                                setQuality(value as ImageQuality)
                              }
                              disabled={
                                mutationGenerate.isPending ||
                                mutationEdit.isPending
                              }
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
                            <span className="font-inter text-xs uppercase">
                              Aspect Ratio (Size)
                            </span>
                          </div>
                          <div className="w-full flex justify-end items-center">
                            <Select
                              value={size}
                              onValueChange={(value) =>
                                setSize(value as ImageSize)
                              }
                              disabled={
                                mutationGenerate.isPending ||
                                mutationEdit.isPending
                              }
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
                        </>
                      )}
                      <div className="flex gap-1 justify-start items-center">
                        <span className="font-inter text-xs uppercase">
                          Samples
                        </span>
                      </div>
                      <div className="w-full flex justify-end items-center">
                        <Select
                          value={imageSamples}
                          onValueChange={setImageSamples}
                          disabled={
                            mutationGenerate.isPending || mutationEdit.isPending
                          }
                        >
                          <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                            <SelectValue placeholder="Amount" />
                          </SelectTrigger>
                          <SelectContent
                            className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                            align="end"
                          >
                            <SelectGroup>
                              {modelToUse === "openai/gpt-image-1" && (
                                <>
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
                                </>
                              )}
                              {modelToUse ===
                                "gemini/gemini-2.5-flash-image-preview" && (
                                <>
                                  <SelectItem
                                    value="1"
                                    className="font-inter text-xs rounded-none"
                                  >
                                    1
                                  </SelectItem>
                                </>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="pointer-events-auto w-full flex p-5 gap-2 justify-between items-center border-t border-[#c9c9c9]">
            <div className="w-full flex gap-5 justify-start items-center">
              <Button
                className="uppercase cursor-pointer font-inter rounded-none"
                variant="secondary"
                disabled={mutationGenerate.isPending || mutationEdit.isPending}
                onClick={async () => {
                  setImagesReferences([]);
                  if (imagesLLMPopupType === "create") {
                    setPromptGenerate("");
                  } else {
                    const newPromptEdit = { ...promptEdit };
                    if (
                      newPromptEdit[
                        imagesLLMPopupImageSelected?.[0].getAttrs().id ?? ""
                      ]
                    ) {
                      delete newPromptEdit[
                        imagesLLMPopupImageSelected?.[0].getAttrs().id ?? ""
                      ];
                    }
                    setPromptEdit(newPromptEdit);
                  }
                  setModeration("auto");
                  setSize("1024x1024");
                  setQuality("medium");
                  setImageSamples("4");
                }}
              >
                RESET
              </Button>
            </div>
            <div className="w-full flex gap-5 justify-end items-center">
              <Button
                className="uppercase cursor-pointer font-inter rounded-none"
                disabled={
                  mutationGenerate.isPending ||
                  mutationEdit.isPending ||
                  (["create"].includes(imagesLLMPopupType) &&
                    (!prompt || prompt.length === 0)) ||
                  (["edit-prompt"].includes(imagesLLMPopupType) &&
                    (!prompt || prompt.length === 0)) ||
                  (["edit-variation"].includes(imagesLLMPopupType) &&
                    (!prompt ||
                      prompt.length === 0 ||
                      !imageReferences ||
                      (imageReferences && imageReferences.length === 0))) ||
                  (["edit-mask"].includes(imagesLLMPopupType) &&
                    (!prompt ||
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

                  setTimeout(() => {
                    const textArea = document.getElementById(
                      "llm-prompt-textarea"
                    ) as HTMLTextAreaElement;

                    if (textArea) {
                      textArea.focus();
                      const length = textArea.value.length;
                      textArea.setSelectionRange(length, length);
                    }
                  }, 100);
                }}
              >
                {mutationGenerate.isPending || mutationEdit.isPending
                  ? "REQUESTING"
                  : buttonText}
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
