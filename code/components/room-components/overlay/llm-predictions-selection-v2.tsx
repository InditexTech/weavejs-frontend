// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useWeave } from "@inditextech/weave-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScaleLoader } from "react-spinners";
import { useCollaborationRoom } from "@/store/store";
import { postImage } from "@/api/post-image";
import { Button } from "@/components/ui/button";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { useIACapabilities } from "@/store/ia";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagesToolActionTriggerParams } from "@/components/actions/images-tool/types";
import { Logo } from "@/components/utils/logo";
import { CheckCheck, X } from "lucide-react";
import { MaskEraserToolAction } from "@/components/actions/mask-eraser-tool/mask-eraser-tool";

export function LLMPredictionsSelectionV2Popup() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);

  const [selectedImages, setSelectedImages] = React.useState<number[]>([]);

  const predictions = useIACapabilities((state) => state.llmPopup.predictions);
  const imagesLLMPopupState = useIACapabilities(
    (state) => state.llmPopup.state
  );
  const setImagesLLMPredictions = useIACapabilities(
    (state) => state.setImagesLLMPredictions
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
  );
  const setImagesLLMPopupState = useIACapabilities(
    (state) => state.setImagesLLMPopupState
  );

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  const queryClient = useQueryClient();

  const handleAddImages = React.useCallback(async () => {
    if (!room) {
      return;
    }

    if (!instance) {
      return;
    }

    const uploadPromises = [];

    for (const index of selectedImages) {
      const imageBase64 = predictions[index].b64_json;
      const imageMimeType = "image/png";

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

      uploadPromises.push(mutationUpload.mutateAsync(file));
    }

    const uploadResult = await Promise.allSettled(uploadPromises);

    if (instance && uploadResult.length > 0) {
      const imagesURLs = [];
      for (const uploadInfo of uploadResult) {
        if (uploadInfo.status === "fulfilled") {
          const room = uploadInfo.value.fileName.split("/")[0];
          const imageId = uploadInfo.value.fileName.split("/")[1];

          const imageURL = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`;
          imagesURLs.push(imageURL);
        }
      }

      const queryKey = ["getImages", room];
      queryClient.invalidateQueries({ queryKey });

      instance.triggerAction<ImagesToolActionTriggerParams, void>(
        "imagesTool",
        {
          imagesURLs,
          padding: 20,
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;

      toast.success("Select where to place the image");

      setSelectedImages([]);
      setImagesLLMPredictions(null);
      setImagesLLMPopupVisible(false);
      setImagesLLMPopupState("idle");
    }
  }, [
    room,
    instance,
    queryClient,
    selectedImages,
    mutationUpload,
    predictions,
    setImagesLLMPopupVisible,
    setImagesLLMPopupState,
    setImagesLLMPredictions,
  ]);

  const handleCheckboxChange = React.useCallback(
    (checked: boolean, index: number) => {
      let newSelectedImages = [...selectedImages];
      if (checked) {
        newSelectedImages.push(index);
      } else {
        newSelectedImages = newSelectedImages.filter(
          (actIndex) => actIndex !== index
        );
      }
      const unique = [...new Set(newSelectedImages)];
      setSelectedImages(unique);
    },
    [selectedImages]
  );

  const generatedImages = React.useMemo(() => {
    if (!predictions) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return predictions.map((prediction: any, index: number) => {
      const isChecked = selectedImages.includes(index);

      return (
        <div
          key={`image-${index}`}
          className="relative w-[320px] h-[320px] aspect-square"
        >
          <div className="absolute top-[16px] right-[16px] z-10">
            <Checkbox
              id="terms"
              value={index}
              checked={isChecked}
              onCheckedChange={(checked) => {
                handleCheckboxChange(checked as boolean, index);
              }}
            />
          </div>
          <div className="w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${prediction.b64_json}`}
              alt="Generated by LLM"
              onKeyUp={(e) => {
                if (e.key === "Space") {
                  let newSelectedImages = [...selectedImages];
                  if (newSelectedImages.includes(index)) {
                    newSelectedImages = newSelectedImages.filter(
                      (actIndex) => actIndex !== index
                    );
                  } else {
                    newSelectedImages.push(index);
                  }
                  const unique = [...new Set(newSelectedImages)];
                  setSelectedImages(unique);
                }
              }}
              onClick={() => {
                let newSelectedImages = [...selectedImages];
                if (newSelectedImages.includes(index)) {
                  newSelectedImages = newSelectedImages.filter(
                    (actIndex) => actIndex !== index
                  );
                } else {
                  newSelectedImages.push(index);
                }
                const unique = [...new Set(newSelectedImages)];
                setSelectedImages(unique);
              }}
              className="w-[320px] h-[320px] cursor-pointer bg-transparent object-contain border border-[#c9c9c9]"
            />
          </div>
        </div>
      );
    });
  }, [predictions, selectedImages, handleCheckboxChange]);

  const handleToggleSelectAll = React.useCallback(() => {
    if (!predictions) {
      return null;
    }

    if (selectedImages.length === 0) {
      setSelectedImages(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        predictions.map((_: any, index: number) => index)
      );
    } else {
      setSelectedImages([]);
    }
  }, [selectedImages, predictions]);

  const loadingText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "uploading":
        return "Uploading...";
    }
  }, [imagesLLMPopupState]);

  const loadingSubText = React.useMemo(() => {
    switch (imagesLLMPopupState) {
      case "uploading":
        return "Uploading the selected image(s), please wait.";
    }
  }, [imagesLLMPopupState]);

  if (!predictions || (predictions && predictions.length === 0)) {
    return null;
  }

  return (
    <>
      <Dialog
        open={predictions && predictions.length > 0}
        onOpenChange={() => {
          setImagesLLMPredictions(null);
        }}
      >
        <DialogContent className="!max-w-[calc(660px_+_48px)]">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Generated Images
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setSelectedImages([]);
                    setImagesLLMPredictions(null);
                    setImagesLLMPopupState("idle");
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
            <DialogDescription className="mt-5 py-2 flex gap-5 justify-between items-center">
              <div className="font-inter text-sm ">
                Select the images you want to keep and add to the room.
              </div>
              <div>
                <Button
                  type="button"
                  className="cursor-pointer font-inter rounded-none !px-3 !py-2 !h-[32px]"
                  onClick={async () => {
                    handleToggleSelectAll();
                  }}
                >
                  <CheckCheck size={20} strokeWidth={1} />
                  SELECT / DESELECT ALL
                </Button>
              </div>
            </DialogDescription>
            <div className="w-full h-[1px] bg-[#c9c9c9]"></div>
          </DialogHeader>
          <div className="w-full grid grid-cols-2 gap-5">{generatedImages}</div>
          <DialogFooter>
            <div className="w-full flex justify-end gap-4">
              <Button
                type="button"
                disabled={selectedImages.length === 0}
                className="cursor-pointer font-inter rounded-none"
                onClick={async () => {
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

                  handleAddImages();
                }}
              >
                ADD IMAGES
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {["uploading"].includes(imagesLLMPopupState) && (
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
