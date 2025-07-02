// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useWeave } from "@inditextech/weave-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagesToolActionTriggerParams } from "@/components/actions/images-tool/types";
import { Logo } from "@/components/utils/logo";

export function LLMPredictionsSelectionPopup() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);

  const [selectedImages, setSelectedImages] = React.useState<number[]>([]);

  const predictions = useIACapabilities((state) => state.llmPopup.predictions);
  const imagesLLMPopupType = useIACapabilities((state) => state.llmPopup.type);
  const imagesLLMPopupState = useIACapabilities(
    (state) => state.llmPopup.state
  );
  const setImagesLLMPredictions = useIACapabilities(
    (state) => state.setImagesLLMPredictions
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
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
      const imageBase64 = predictions[index].bytesBase64Encoded;
      const imageMimeType = predictions[index].mimeType;

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
    }
  }, [
    room,
    instance,
    queryClient,
    selectedImages,
    mutationUpload,
    predictions,
    setImagesLLMPopupVisible,
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

    const filteredPredictions = predictions.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prediction: any) => prediction.mimeType
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return filteredPredictions.map((prediction: any, index: number) => {
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
              className="bg-white"
              checked={isChecked}
              onCheckedChange={(checked) => {
                handleCheckboxChange(checked as boolean, index);
              }}
            />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`}
            alt="Image generated by LLM"
            className="w-full h-full bg-transparent object-contain border border-[#c9c9c9]"
          />
        </div>
      );
    });
  }, [predictions, selectedImages, handleCheckboxChange]);

  const handleToggleSelectAll = React.useCallback(() => {
    if (!predictions) {
      return null;
    }

    const filteredPredictions = predictions.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prediction: any) => prediction.mimeType
    );

    if (selectedImages.length === 0) {
      setSelectedImages(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredPredictions.map((_: any, index: number) => index)
      );
    } else {
      setSelectedImages([]);
    }
  }, [selectedImages, predictions]);

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

  if (!predictions) {
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
        <form>
          <DialogContent className="!max-w-[calc(660px_+_48px)]">
            <DialogHeader>
              <DialogTitle className="font-inter text-2xl font-normal">
                Generated Images
              </DialogTitle>
              <DialogDescription className="font-inter text-sm mt-5">
                Select the images you want to keep and add to the room.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full grid grid-cols-2 gap-5">
              {generatedImages}
            </div>
            <DialogFooter>
              <div className="w-full flex justify-between gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer font-inter rounded-none"
                  onClick={() => {
                    setSelectedImages([]);
                    setImagesLLMPredictions(null);
                  }}
                >
                  CLOSE
                </Button>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="cursor-pointer font-inter rounded-none"
                    onClick={async () => {
                      handleToggleSelectAll();
                    }}
                  >
                    SELECT / DESELECT ALL
                  </Button>
                  <Button
                    type="submit"
                    disabled={selectedImages.length === 0}
                    className="cursor-pointer font-inter rounded-none"
                    onClick={async () => {
                      handleAddImages();
                    }}
                  >
                    ADD SELECTED
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
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
