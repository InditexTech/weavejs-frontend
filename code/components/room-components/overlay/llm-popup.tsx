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
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useCollaborationRoom } from "@/store/store";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { postGenerateImage } from "@/api/post-generate-image";
import { v4 as uuidv4 } from "uuid";
import { Logo } from "@/components/utils/logo";
import { toast } from "sonner";

const LLM_MODEL = "vertex_ai/imagen-4.0-generate-preview-06-06";

export function LLMGenerationPopup() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);

  const [prompt, setPrompt] = React.useState<string>("");
  // const [size, setSize] = React.useState<string>("1024x1024");
  // const [sampleImageStyle, setSampleImageStyle] =
  //   React.useState<string>("photograph");
  // const [personGeneration, setPersonGeneration] =
  //   React.useState<string>("allow_adult");
  // const [mimeType, setMimeType] = React.useState<string>("image/png");
  // const [compressionQuality, setCompressionQuality] =
  //   React.useState<string>("75");

  const room = useCollaborationRoom((state) => state.room);
  const setImagesLLMPopupError = useCollaborationRoom(
    (state) => state.setImagesLLMPopupError
  );
  const imagesLLMPopupState = useCollaborationRoom(
    (state) => state.images.llmPopup.state
  );
  const imagesLLMPopupError = useCollaborationRoom(
    (state) => state.images.llmPopup.error
  );
  const setImagesLLMPopupState = useCollaborationRoom(
    (state) => state.setImagesLLMPopupState
  );
  const setImagesLLMPopupVisible = useCollaborationRoom(
    (state) => state.setImagesLLMPopupVisible
  );
  const imagesLLMPopupVisible = useCollaborationRoom(
    (state) => state.images.llmPopup.visible
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
        setImagesLLMPopupError(null);
        setImagesLLMPopupVisible(false);
      }
    },
    [instance, queryClient, setImagesLLMPopupVisible, setImagesLLMPopupError]
  );

  const mutationGenerate = useMutation({
    mutationFn: async (prompt: string) => {
      setImagesLLMPopupState("generating");
      return await postGenerateImage(room ?? "", LLM_MODEL, prompt);
    },
    onSettled: () => {
      setImagesLLMPopupState("idle");
    },
    onSuccess: (data) => {
      setImagesLLMPopupState("uploading");

      const imageBase64 = data.data[0].b64_json;

      const binary = atob(imageBase64); // decode base64
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: "image/png" });
      const imageId = `llm_gen_${uuidv4()}`;
      const file = new File([blob], `${imageId}`, {
        type: "image/png",
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

  const handleTextAreaChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(event.target.value);
    },
    []
  );

  const buttonText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "generating":
        return "Generating...";
      case "uploading":
        return "Uploading...";
      default:
        return "Generate Image";
    }
  }, [imagesLLMPopupState]);

  const loadingText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "generating":
        return "Generating image...";
      case "uploading":
        return "Uploading image...";
    }
  }, [imagesLLMPopupState]);

  if (!imagesLLMPopupVisible) {
    return null;
  }

  return (
    <>
      <div className="absolute bottom-[16px] right-[16px] min-w-[500px] bg-white text-black border border-[#c9c9c9] pointer-events-auto">
        <div className="flex flex-col gap-2 p-5 justify-center items-end bg-white">
          <Textarea
            className="rounded-none"
            value={prompt}
            disabled={mutationGenerate.isPending}
            onFocus={() => {
              window.weaveOnFieldFocus = true;
            }}
            onBlurCapture={() => {
              window.weaveOnFieldFocus = false;
            }}
            onChange={handleTextAreaChange}
            placeholder="Example: generate a model with a kaki dress."
          />
          {/* <div className="flex gap-2 justify-start items-center">
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="rounded-none !h-[30px]">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1536x1024">landscape</SelectItem>
                  <SelectItem value="1024x1536">portrait</SelectItem>
                  <SelectItem value="1024x1024">Squared</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={sampleImageStyle}
              onValueChange={setSampleImageStyle}
            >
              <SelectTrigger className="font-inter rounded-none !h-[30px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="photograph">Photograph</SelectItem>
                  <SelectItem value="digital_art">Digital Art</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="sketch">Sketch</SelectItem>
                  <SelectItem value="watercolor">Watercolor</SelectItem>
                  <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="pop_art">Pop Art</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={personGeneration}
              onValueChange={setPersonGeneration}
            >
              <SelectTrigger className="font-inter rounded-none !h-[30px]">
                <SelectValue placeholder="Person generation" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="dont_allow">Don't allow</SelectItem>
                  <SelectItem value="allow_adult">Allow adults</SelectItem>
                  <SelectItem value="allow_all">Allow all</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div> */}
          <div className="flex gap-2 justify-start items-center mt-4">
            {/* <div className="flex gap-2 justify-start items-center">
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
              <Select value={mimeType} onValueChange={setMimeType}>
                <SelectTrigger className="font-inter rounded-none !h-[30px]">
                  <SelectValue placeholder="Aspect Ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div> */}
            <Button
              className="uppercase cursor-pointer font-inter rounded-none"
              disabled={
                mutationGenerate.isPending || !prompt || prompt.length === 0
              }
              onClick={async () => {
                setImagesLLMPopupError(null);
                mutationGenerate.mutate(prompt);
              }}
            >
              {buttonText}
            </Button>
          </div>
          {imagesLLMPopupError && (
            <div className="font-inter text-xs text-[#cc0000] mt-4">
              Failed to generate image.
            </div>
          )}
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
