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
import Konva from "konva";
import {
  getDownscaleRatio,
  getImageSizeFromFile,
  WEAVE_IMAGE_TOOL_UPLOAD_TYPE,
  WeaveImageToolActionTriggerParams,
  WeaveImageToolActionTriggerReturn,
} from "@inditextech/weave-sdk";
import { IMAGE_WITH_TITLE_ACTION_NAME } from "../actions/image-with-title-tool/constants";

export function UploadImageWithTitle() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const showSelectFileWithTitle = useCollaborationRoom(
    (state) => state.images.showSelectFileWithTitle,
  );
  const setShowSelectFileWithImage = useCollaborationRoom(
    (state) => state.setShowSelectFileWithTitleImage,
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads,
  );

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (params: { file: File; imageId: string }) => {
      if (workloadsEnabled) {
        return await postImageV2(room ?? "", params.imageId, params.file);
      }
      return await postImage(room ?? "", params.file);
    },
  });

  const handleUploadFile = React.useCallback(
    async (file: File, position?: Konva.Vector2d) => {
      const resourceId = uuidv4();

      if (!instance) {
        return;
      }

      const imageSize = await getImageSizeFromFile(file);
      const downscaleRatio = getDownscaleRatio(
        imageSize.width,
        imageSize.height,
      );

      const uploadImageFunction = async (file: File, resourceId: string) => {
        const toastId = toast.loading("Uploading image...", {
          duration: Infinity,
          dismissible: false,
        });

        const data = await mutationUpload.mutateAsync(
          { file, imageId: resourceId },
          {
            onSuccess: async () => {
              toast.dismiss(toastId);
              toast.success("Image uploaded successfully");
            },
            onError: (ex) => {
              toast.dismiss(toastId);
              toast.error("Error uploading image");

              console.error(ex);
              console.error("Error uploading image");
            },
          },
        );

        const room = data.image.roomId;
        const imageId = data.image.imageId;

        const queryKey = ["getImages", room];
        queryClient.invalidateQueries({ queryKey });

        const apiEndpoint = import.meta.env.VITE_API_V2_ENDPOINT;

        return `${apiEndpoint}/weavejs/rooms/${room}/images/${imageId}`;
      };

      instance.triggerAction<
        WeaveImageToolActionTriggerParams,
        WeaveImageToolActionTriggerReturn
      >(IMAGE_WITH_TITLE_ACTION_NAME, {
        type: WEAVE_IMAGE_TOOL_UPLOAD_TYPE.FILE,
        image: {
          file,
          downscaleRatio,
        },
        uploadImageFunction,
        imageId: resourceId,
        ...(position && { position }),
      });
    },
    [instance, mutationUpload, queryClient],
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
      const position: Konva.Vector2d | null | undefined = instance
        .getStage()
        .getRelativePointerPosition();

      if (!position) {
        return;
      }

      const { mousePoint } = instance.getMousePointer(position);

      if (e.dataTransfer?.items) {
        if (e.dataTransfer?.items.length === 1) {
          const item = e.dataTransfer.items[0];
          if (item.kind === "file" && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              handleUploadFile(file, mousePoint);
            }
          }
        }
        return;
      }
      if (e.dataTransfer?.files) {
        if (e.dataTransfer?.items.length === 1) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            handleUploadFile(file, mousePoint);
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
  }, [instance, mutationUpload, handleUploadFile]);

  React.useEffect(() => {
    if (showSelectFileWithTitle) {
      inputFileRef.current.click();
      setShowSelectFileWithImage(false);
    }
  }, [showSelectFileWithTitle, setShowSelectFileWithImage]);

  return (
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp"
      name="image"
      ref={inputFileRef}
      className="hidden"
      onClick={() => {
        inputFileRef.current.value = null;
      }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          handleUploadFile(file);
        }
      }}
    />
  );
}
