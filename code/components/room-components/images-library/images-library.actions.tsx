// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { BrushCleaning, Link, Trash, Unlink } from "lucide-react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { delImage } from "@/api/v2/del-image";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { postRemoveBackground as postRemoveBackgroundV2 } from "@/api/v2/post-remove-background";
import { useIACapabilitiesV2 } from "@/store/ia-v2";
import { ImageEntity } from "./types";
import { cn } from "@/lib/utils";

type ImagesLibraryActions = {
  images: ImageEntity[];
  appImages: WeaveStateElement[];
  selectedImages: ImageEntity[];
};

export const ImagesLibraryActions = ({
  images,
  appImages,
  selectedImages,
}: Readonly<ImagesLibraryActions>) => {
  const instance = useWeave((state) => state.instance);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );

  const imagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.visible
  );
  const imagesReferences = useIACapabilitiesV2(
    (state) => state.references.images
  );
  const setImagesReferences = useIACapabilitiesV2(
    (state) => state.setImagesLLMReferences
  );

  const mutationUploadV2 = useMutation({
    mutationFn: async ({
      userId,
      clientId,
      imageId,
      image,
    }: {
      userId: string;
      clientId: string;
      imageId: string;
      image: {
        dataBase64: string;
        contentType: string;
      };
    }) => {
      return await postRemoveBackgroundV2(
        userId,
        clientId,
        room ?? "",
        imageId,
        image
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting images background removal...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting images background removal.");
    },
  });

  const mutationDelete = useMutation({
    mutationFn: async (imageId: string) => {
      return await delImage(
        user?.name ?? "",
        clientId ?? "",
        room ?? "",
        imageId
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting images deletion...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting images deletion.");
    },
  });

  const handleDeleteImage = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (image: any) => {
      if (!instance) {
        return;
      }

      mutationDelete.mutate(image.imageId);
    },
    [instance, mutationDelete]
  );

  const handleSetImagesReference = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (images: any[]) => {
      const newReferences = [...imagesReferences];

      for (const image of images) {
        const element = document.querySelector(
          `img[id="${image.imageId}"]`
        ) as HTMLImageElement | null;

        if (!element) {
          return;
        }

        const existsReference = newReferences.find(
          (ele) => ele.id === image.imageId
        );

        if (typeof existsReference !== "undefined") {
          continue;
        }

        const canvas = document.createElement("canvas");
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(element, 0, 0);

          const dataURL = canvas.toDataURL("image/png");
          newReferences.push({
            id: image.imageId,
            aspectRatio: image.aspectRatio,
            base64Image: dataURL,
          });
        }
      }

      setImagesReferences(newReferences);
    },
    [imagesReferences, setImagesReferences]
  );

  const handleRemoveImagesReference = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (images: any[]) => {
      let newReferences = [...imagesReferences];

      for (const image of images) {
        const element = document.querySelector(
          `img[id="${image.imageId}"]`
        ) as HTMLImageElement | null;

        if (!element) {
          continue;
        }

        newReferences = newReferences.filter((ele) => ele.id !== image.imageId);
      }

      setImagesReferences(newReferences);
    },
    [imagesReferences, setImagesReferences]
  );

  const handleRemoveBackground = React.useCallback(
    (image: ImageEntity) => {
      if (!instance) {
        return;
      }

      const element = document.querySelector(
        `img[id="${image.imageId}"]`
      ) as HTMLImageElement | null;

      if (!element) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = element.naturalWidth;
      canvas.height = element.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(element, 0, 0);

        const dataBase64Url = canvas.toDataURL("image/png");

        const dataBase64 = dataBase64Url.split(",")[1];

        mutationUploadV2.mutate({
          userId: user?.name ?? "",
          clientId: clientId ?? "",
          imageId: uuidv4(),
          image: {
            dataBase64,
            contentType: "image/png",
          },
        });
      }
    },
    [instance, clientId, user, mutationUploadV2]
  );

  const realSelectedImages = React.useMemo(() => {
    return selectedImages.filter((image) => images.includes(image));
  }, [selectedImages, images]);

  const inUseSelectedImages = React.useMemo(() => {
    const inUse = [];

    for (const image of realSelectedImages) {
      const appImage = appImages.find(
        (appImage) => appImage.props.imageId === image.imageId
      );
      if (typeof appImage !== "undefined") {
        inUse.push(image);
      }
    }

    return inUse;
  }, [realSelectedImages, appImages]);

  const [unreferencedSelectedImages, referencedSelectedImages] =
    React.useMemo(() => {
      const unreferenced = [];
      const referenced = [];

      for (const image of realSelectedImages) {
        const referenceImage = imagesReferences.find(
          (appImage) => appImage.id === image.imageId
        );
        if (typeof referenceImage !== "undefined") {
          referenced.push(image);
        } else {
          unreferenced.push(image);
        }
      }

      return [unreferenced, referenced];
    }, [realSelectedImages, imagesReferences]);

  const allRealImages = React.useMemo(() => {
    return realSelectedImages.every((image) =>
      ["completed"].includes(image.status)
    );
  }, [realSelectedImages]);

  const actions = React.useMemo(() => {
    const selectionActions = [];

    if (realSelectedImages.length > 0 && inUseSelectedImages.length === 0) {
      selectionActions.push(
        <button
          key="delete-selected"
          className="cursor-pointer flex gap-2 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
          onClick={() => {
            for (const image of realSelectedImages) {
              handleDeleteImage(image);
            }
          }}
        >
          <Trash strokeWidth={1} size={16} stroke="red" />
        </button>
      );
    }

    if (realSelectedImages.length > 0 && allRealImages) {
      selectionActions.push(
        <button
          key="remove-background-selected"
          className="cursor-pointer flex gap-2 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
          onClick={() => {
            for (const image of realSelectedImages) {
              handleRemoveBackground(image);
            }
          }}
        >
          <BrushCleaning strokeWidth={1} size={16} />
        </button>
      );
    }

    if (
      imagesLLMPopupVisibleV2 &&
      realSelectedImages.length > 0 &&
      realSelectedImages.length === referencedSelectedImages.length &&
      allRealImages
    ) {
      selectionActions.push(
        <button
          key="remove-image-ref-selected"
          className="cursor-pointer flex gap-2 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
          onClick={() => {
            handleRemoveImagesReference(realSelectedImages);
          }}
        >
          <Unlink strokeWidth={1} size={16} />
        </button>
      );
    }

    if (
      imagesLLMPopupVisibleV2 &&
      realSelectedImages.length > 0 &&
      realSelectedImages.length === unreferencedSelectedImages.length &&
      realSelectedImages.length <= 4 - imagesReferences.length &&
      allRealImages
    ) {
      selectionActions.push(
        <button
          key="set-images-reference-selected"
          className="cursor-pointer flex gap-2 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
          onClick={() => {
            handleSetImagesReference(realSelectedImages);
          }}
        >
          <Link strokeWidth={1} size={16} />
        </button>
      );
    }

    return selectionActions;
  }, [
    handleDeleteImage,
    handleRemoveBackground,
    handleRemoveImagesReference,
    handleSetImagesReference,
    imagesLLMPopupVisibleV2,
    referencedSelectedImages.length,
    inUseSelectedImages.length,
    imagesReferences.length,
    unreferencedSelectedImages.length,
    realSelectedImages,
    allRealImages,
  ]);

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.images) {
    return null;
  }

  return (
    <div className="w-full h-[40px] p-3 px-6 bg-white flex justify-between items-center border-t-[0.5px] border-[#c9c9c9]">
      <div
        className={cn("flex gap-2 items-center font-inter font-light text-xs", {
          ["justify-start"]: actions.length > 0,
          ["w-full justify-center"]: actions.length === 0,
        })}
      >
        {actions.length > 0 ? (
          "SELECTION ACTIONS"
        ) : (
          <span>select an image</span>
        )}
      </div>
      <div className="flex gap-2 justify-end items-center">{actions}</div>
    </div>
  );
};
