// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useCollaborationRoom } from "@/store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { postImage as postImageV2 } from "@/api/v2/post-image";
import { useWeave } from "@inditextech/weave-react";
import {
  getDownscaleRatio,
  getImageSizeFromFile,
  getPositionRelativeToContainerOnPosition,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_UPLOAD_TYPE,
  WeaveImagesFile,
  WeaveImagesToolActionTriggerParams,
} from "@inditextech/weave-sdk";
import Konva from "konva";

export function UploadImages() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const showSelectFiles = useCollaborationRoom(
    (state) => state.images.showSelectFiles,
  );
  const setShowSelectFilesImages = useCollaborationRoom(
    (state) => state.setShowSelectFilesImages,
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads,
  );

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      if (workloadsEnabled) {
        return await postImageV2(room ?? "", file);
      }
      return await postImage(room ?? "", file);
    },
  });

  const handleUploadFiles = React.useCallback(
    async (files: File[], position?: Konva.Vector2d) => {
      if (!instance) {
        return;
      }

      const images: WeaveImagesFile[] = [];

      for (const file of files) {
        const imageId = uuidv4();
        const imageSize = await getImageSizeFromFile(file);
        const downscaleRatio = getDownscaleRatio(
          imageSize.width,
          imageSize.height,
        );
        images.push({
          file,
          width: imageSize.width,
          height: imageSize.height,
          downscaleRatio,
          imageId,
        });
      }

      let toastId: string | number | undefined = undefined;

      const uploadImageFunction = async (file: File) => {
        const data = await mutationUpload.mutateAsync(file);
        const room = data.image.roomId;
        const imageId = data.image.imageId;
        return `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`;
      };

      const onStartUploading = () => {
        toastId = toast.loading("Uploading images...", {
          duration: Infinity,
          dismissible: false,
        });
      };

      const onFinishedUploading = () => {
        toast.dismiss(toastId);
        toast.success("Images uploaded successfully");

        const queryKey = ["getImages", room];
        queryClient.invalidateQueries({ queryKey });
      };

      instance.triggerAction<WeaveImagesToolActionTriggerParams, void>(
        WEAVE_IMAGES_TOOL_ACTION_NAME,
        {
          type: WEAVE_IMAGES_TOOL_UPLOAD_TYPE.FILE,
          images,
          uploadImageFunction,
          onStartUploading,
          onFinishedUploading,
          forceMainContainer: false,
          ...(position && { position }),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;
    },
    [instance, queryClient, room, mutationUpload],
  );

  React.useEffect(() => {
    const onStageDrop = (e: DragEvent) => {
      if (!instance) {
        return;
      }

      if (instance.isDragStarted()) {
        return;
      }

      instance.getStage().setPointersPositions(e);
      const position: Konva.Vector2d | null | undefined =
        getPositionRelativeToContainerOnPosition(instance);

      if (!position) {
        return;
      }

      const { mousePoint } = instance.getMousePointer(position);

      if (e.dataTransfer?.items) {
        if (e.dataTransfer?.items.length > 1) {
          const files = [];
          for (const item of e.dataTransfer.items) {
            if (item.kind === "file" && item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                files.push(file);
              }
            }
          }

          if (files.length > 0) {
            handleUploadFiles(files, mousePoint);
          }
        }
        return;
      }
      if (e.dataTransfer?.files) {
        if (e.dataTransfer?.files.length > 1) {
          const files = [];
          for (const file of e.dataTransfer.files) {
            if (file.type.startsWith("image/")) {
              files.push(file);
            }
          }
          if (files.length > 0) {
            handleUploadFiles(files, mousePoint);
          }
        }
        return;
      }
    };

    if (instance) {
      instance.addEventListener("onStageDrop", onStageDrop);
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onStageDrop", onStageDrop);
      }
    };
  }, [instance, mutationUpload, handleUploadFiles]);

  React.useEffect(() => {
    if (showSelectFiles) {
      inputFileRef.current.click();
      setShowSelectFilesImages(false);
    }
  }, [showSelectFiles, setShowSelectFilesImages]);

  return (
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp"
      name="image"
      multiple
      ref={inputFileRef}
      className="hidden"
      onClick={() => {
        inputFileRef.current.value = null;
      }}
      onChange={(e) => {
        const files = e.target.files;
        if (files) {
          handleUploadFiles(Array.from(files));
        }
      }}
    />
  );
}
