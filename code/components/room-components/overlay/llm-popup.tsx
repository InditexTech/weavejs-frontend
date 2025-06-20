// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWeave } from "@inditextech/weave-react";
import { postImage } from "@/api/post-image";
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
import { v4 as uuidv4 } from "uuid";
import { Logo } from "@/components/utils/logo";
import { toast } from "sonner";
import { useIACapabilities } from "@/store/ia";
import { cn } from "@/lib/utils";
import { InputNumber } from "../inputs/input-number";

const LLM_MODEL = "imagen-4.0-generate-preview-06-06";

export function LLMGenerationPopup() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);

  const [prompt, setPrompt] = React.useState<string>("");
  const [negativePrompt, setNegativePrompt] = React.useState<string>("");
  const [aspectRatio, setAspectRatio] = React.useState<string>("1:1");
  const [personGeneration, setPersonGeneration] =
    React.useState<string>("allow_all");
  const [mimeType, setMimeType] = React.useState<string>("image/png");
  const [strength, setStrength] = React.useState<string>("0.3");
  const [guidanceStrength, setGuidanceStrength] =
    React.useState<string>("12.0");
  const [compressionQuality, setCompressionQuality] =
    React.useState<string>("75");

  const room = useCollaborationRoom((state) => state.room);
  const setImagesLLMPopupError = useIACapabilities(
    (state) => state.setImagesLLMPopupError
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

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  const handleUploadFile = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      if (instance) {
        const room = data.fileName.split("/")[0];
        const imageId = data.fileName.split("/")[1];

        const queryKey = ["getImages", room];
        queryClient.invalidateQueries({ queryKey });

        const imageURL = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`;

        const { finishUploadCallback } = instance.triggerAction(
          "imageTool"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any;

        instance.updatePropsAction("imageTool", { imageId });

        finishUploadCallback(imageURL);

        toast.success("Select where to place the image");

        setPrompt("");
        setAspectRatio("1:1");
        setPersonGeneration("allow_adult");
        setMimeType("image/png");
        setCompressionQuality("75");
        setImagesLLMPopupError(null);
        setImagesLLMPopupVisible(false);
      }
    },
    [instance, queryClient, setImagesLLMPopupVisible, setImagesLLMPopupError]
  );

  const mutationGenerate = useMutation({
    mutationFn: async (prompt: string) => {
      setImagesLLMPopupState("generating");
      return await postGenerateImage(
        {
          roomId: room ?? "",
          model: LLM_MODEL,
          prompt,
        },
        {
          aspectRatio,
          personGeneration,
          outputOptions: {
            mimeType,
            compressionQuality: Number(compressionQuality),
          },
        }
      );
    },
    onSettled: () => {
      setImagesLLMPopupState("idle");
    },
    onSuccess: (data) => {
      setImagesLLMPopupState("uploading");

      const imageBase64 = data.predictions[0].bytesBase64Encoded;
      const imageMimeType = data.predictions[0].mimeType;

      const binary = atob(imageBase64); // decode base64
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: imageMimeType });
      const imageId = `llm_gen_${uuidv4()}`;
      const file = new File([blob], `${imageId}`, {
        type: imageMimeType,
        lastModified: Date.now(),
      });

      mutationUpload.mutate(file, {
        onSettled: () => {
          setImagesLLMPopupState("idle");
        },
        onSuccess: handleUploadFile,
        onError: (error) => {
          setImagesLLMPopupError(error);
        },
      });
    },
    onError(error) {
      setImagesLLMPopupError(error);
    },
  });

  const mutationEdit = useMutation({
    mutationFn: async ({
      prompt,
      strength,
      guidanceStrength,
      imageBase64,
    }: {
      prompt: string;
      strength: string;
      guidanceStrength: string;
      imageBase64: string;
    }) => {
      setImagesLLMPopupState("generating");
      return await postEditImage({
        roomId: room ?? "",
        prompt,
        image: imageBase64.split(",")[1],
        strength: parseFloat(strength),
        guidance_strength: parseFloat(guidanceStrength),
      });
    },
    onSettled: () => {
      setImagesLLMPopupState("idle");
    },
    onSuccess: (data) => {
      setImagesLLMPopupState("uploading");

      const imageBase64 = data.predictions[0].bytesBase64Encoded;
      const imageMimeType = data.predictions[0].mimeType;

      const binary = atob(imageBase64); // decode base64
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: imageMimeType });
      const imageId = `llm_gen_${uuidv4()}`;
      const file = new File([blob], `${imageId}`, {
        type: imageMimeType,
        lastModified: Date.now(),
      });

      mutationUpload.mutate(file, {
        onSettled: () => {
          setImagesLLMPopupState("idle");
        },
        onSuccess: handleUploadFile,
        onError: (error) => {
          setImagesLLMPopupError(error);
        },
      });
    },
    onError(error) {
      setImagesLLMPopupError(error);
    },
  });

  React.useEffect(() => {
    if (imagesLLMPopupVisible) {
      setPrompt("");
      setAspectRatio("1:1");
      setPersonGeneration("allow_adult");
      setMimeType("image/png");
      setCompressionQuality("75");
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
        if (imagesLLMPopupType === "edit") {
          return "Editing...";
        }
      case "uploading":
        return "Uploading...";
      default:
        if (imagesLLMPopupType === "create") {
          return "Generate Image";
        }
        if (imagesLLMPopupType === "edit") {
          return "Edit Image";
        }
    }
  }, [imagesLLMPopupState, imagesLLMPopupType]);

  const loadingText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "generating":
        if (imagesLLMPopupType === "create") {
          return "Generating image...";
        }
        if (imagesLLMPopupType === "edit") {
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
      <div className="absolute bottom-[80px] right-[16px] left-[16px] min-w-[600px] pointer-events-none">
        <div className="w-full flex justify-center items-center">
          <div
            className={cn(
              "grid gap-5 p-5 bg-white text-black border border-[#c9c9c9] pointer-events-auto",
              {
                ["grid-cols-1 min-w-[600px]"]: imagesLLMPopupType === "create",
                ["grid-cols-[auto_1fr] min-w-[820px]"]:
                  imagesLLMPopupType === "edit",
              }
            )}
          >
            {imagesLLMPopupType === "edit" && imagesLLMPopupImageBase64 && (
              <div className="max-w-[200px] h-full bg-[#c9c9c9] aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagesLLMPopupImageBase64}
                  alt="Image to edit miniature feedback"
                  className="w-full h-full bg-transparent object-cover"
                />
              </div>
            )}
            <div className="min-w-[600px] max-w-[700px] flex flex-col gap-2 justify-center items-start bg-white text-black">
              <div className="font-inter text-xl mb-4">
                {imagesLLMPopupType === "create" && "Create an Image"}
                {imagesLLMPopupType === "edit" && "Edit Image"}
              </div>
              <div className="font-inter text-sm">Prompt:</div>
              <Textarea
                className="rounded-none !border-black !shadow-none"
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
              {imagesLLMPopupType === "edit" && (
                <>
                  <div className="font-inter text-sm">Negative prompt:</div>
                  <Textarea
                    className="rounded-none !border-black !shadow-none"
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
                </>
              )}
              <div className="w-full flex gap-3 justify-end items-center mb-4">
                <div className="flex gap-1 justify-end items-center font-inter text-xs">
                  {imagesLLMPopupType === "edit" && (
                    <>
                      <div className="font-inter text-xs">Guidance Scale</div>
                      <div className="w-[60px]">
                        <InputNumber
                          className="!h-[30px] !border-black"
                          max={20}
                          min={0}
                          value={parseFloat(guidanceStrength)}
                          onChange={(value) => {
                            setGuidanceStrength(`${value}`);
                          }}
                        />
                      </div>
                      <div className="font-inter text-xs">Strength</div>
                      <div className="w-[60px]">
                        <InputNumber
                          className="!h-[30px] !border-black"
                          max={1}
                          min={0}
                          value={parseFloat(strength)}
                          onChange={(value) => {
                            setStrength(`${value}`);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {imagesLLMPopupType === "create" && (
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="font-inter rounded-none !h-[30px] !border-black !shadow-none">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="4:3">Landscape (4:3)</SelectItem>
                          <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                          <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                          <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                          <SelectItem value="1:1">Squared (1:1)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {/* <div className="flex gap-1 justify-end items-center font-inter text-xs">
                  <Select
                    value={personGeneration}
                    onValueChange={setPersonGeneration}
                  >
                    <SelectTrigger className="font-inter rounded-none !h-[30px]">
                      <SelectValue placeholder="Person generation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="dont_allow">
                          Don&apos;t allow persons on generation
                        </SelectItem>
                        <SelectItem value="allow_adult">
                          Allow only adults on generation
                        </SelectItem>
                        <SelectItem value="allow_all">
                          Allow all persons on generation
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
              <div className="h-[1px] w-full bg-[#c9c9c9]"></div>
              <div className="w-full flex gap-2 justify-end items-center mt-4">
                {/* <div className="col-span-2 flex gap-1 justify-end items-center font-inter text-xs">
                  <div>Output Format</div>
                  <Select value={mimeType} onValueChange={setMimeType}>
                    <SelectTrigger className="font-inter rounded-none !h-[30px]">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="image/png">PNG</SelectItem>
                        <SelectItem value="image/jpeg">JPEG</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {["image/jpeg"].includes(mimeType) && (
                    <div className="flex gap-1 justify-start items-center">
                      <div className="font-inter text-xs">Quality</div>{" "}
                      <Input
                        className="font-inter rounded-none !h-[30px] max-w-[50px]"
                        value={compressionQuality}
                        onChange={(e) => {
                          setCompressionQuality(e.target.value);
                        }}
                      />
                      <div className="font-inter text-xs">%</div>
                    </div>
                  )}
                </div> */}
                <Button
                  variant={"secondary"}
                  className="uppercase cursor-pointer font-inter rounded-none"
                  onClick={async () => {
                    setPrompt("");
                    setAspectRatio("1:1");
                    setPersonGeneration("allow_adult");
                    setMimeType("image/png");
                    setCompressionQuality("75");
                    setImagesLLMPopupError(null);
                    setImagesLLMPopupVisible(false);
                  }}
                >
                  Close
                </Button>
                <Button
                  className="uppercase cursor-pointer font-inter rounded-none"
                  disabled={
                    mutationGenerate.isPending || !prompt || prompt.length === 0
                  }
                  onClick={async () => {
                    setImagesLLMPopupError(null);
                    if (imagesLLMPopupType === "create") {
                      mutationGenerate.mutate(prompt);
                    }
                    if (imagesLLMPopupType === "edit") {
                      mutationEdit.mutate({
                        prompt,
                        strength,
                        guidanceStrength,
                        imageBase64: imagesLLMPopupImageBase64 ?? "",
                      });
                    }
                  }}
                >
                  {buttonText}
                </Button>
              </div>
              {imagesLLMPopupError && (
                <div className="font-inter text-xs text-[#cc0000] mt-4">
                  {imagesLLMPopupType === "create" &&
                    "Failed to generate image."}
                  {imagesLLMPopupType === "edit" && "Failed to edit image."}
                </div>
              )}
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
