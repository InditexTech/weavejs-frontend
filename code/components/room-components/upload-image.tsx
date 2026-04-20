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
  getPositionRelativeToContainerOnPosition,
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGE_TOOL_UPLOAD_TYPE,
  WeaveImageToolActionTriggerParams,
  WeaveImageToolActionTriggerReturn,
} from "@inditextech/weave-sdk";

export function UploadImage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const showSelectFile = useCollaborationRoom(
    (state) => state.images.showSelectFile,
  );
  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage,
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

      const uploadImageFunction = async (file: File) => {
        const toastId = toast.loading("Uploading image...", {
          duration: Infinity,
          dismissible: false,
        });

        const data = await mutationUpload.mutateAsync(file, {
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
        });

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
      >(WEAVE_IMAGE_TOOL_ACTION_NAME, {
        type: WEAVE_IMAGE_TOOL_UPLOAD_TYPE.FILE,
        image: {
          file,
          downscaleRatio,
        },
        uploadImageFunction,
        imageId: resourceId,
        forceMainContainer: false,
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
      const position: Konva.Vector2d | null | undefined =
        getPositionRelativeToContainerOnPosition(instance);

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
    if (showSelectFile) {
      inputFileRef.current.click();
      setShowSelectFileImage(false);
    }
  }, [showSelectFile, setShowSelectFileImage]);

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
