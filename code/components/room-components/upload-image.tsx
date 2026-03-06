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
import { getPositionRelativeToContainerOnPosition } from "@inditextech/weave-sdk";

export function UploadImage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const showSelectFile = useCollaborationRoom(
    (state) => state.images.showSelectFile,
  );
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage,
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
    (file: File, position?: Konva.Vector2d) => {
      const resourceId = uuidv4();

      const reader = new FileReader();
      reader.onloadend = () => {
        if (!instance) {
          return;
        }

        const { nodeId, finishUploadCallback } = instance.triggerAction(
          "imageTool",
          {
            imageId: resourceId,
            imageData: reader.result as string,
            ...(position && { position, forceMainContainer: true }),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any;

        const toastId = toast.loading("Uploading image...", {
          duration: Infinity,
        });

        mutationUpload.mutate(file, {
          onSuccess: (data) => {
            toast.dismiss(toastId);
            toast.success("Image uploaded successfully");

            const queryKey = ["getImages", room];
            queryClient.invalidateQueries({ queryKey });

            if (!instance) {
              return;
            }

            if (workloadsEnabled) {
              inputFileRef.current.value = null;
              const room = data.image.roomId;
              const imageId = data.image.imageId;

              finishUploadCallback?.(
                nodeId,
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
              );
            }
          },
          onError: (ex) => {
            toast.dismiss(toastId);
            toast.error("Error uploading image");

            console.error(ex);
            console.error("Error uploading image");
          },
        });
      };
      reader.onerror = () => {
        toast.error("Error reading image file");
      };
      reader.readAsDataURL(file);
    },
    [instance, room, workloadsEnabled, mutationUpload, queryClient],
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
        [...e.dataTransfer?.items].forEach((item) => {
          if (item.kind === "file" && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              handleUploadFile(file, mousePoint);
            }
          }
        });
        return;
      }
      if (e.dataTransfer?.files) {
        [...e.dataTransfer.files].forEach((file) => {
          if (file.type.startsWith("image/")) {
            handleUploadFile(file, mousePoint);
          }
        });
        return;
      }
    };

    if (instance) {
      instance.addEventListener("onStageDrop", onStageDrop);
    }

    if (showSelectFile && inputFileRef.current) {
      inputFileRef.current.addEventListener("cancel", () => {
        instance?.cancelAction("imageTool");
      });
      inputFileRef.current.click();
      setShowSelectFileImage(false);
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onStageDrop", onStageDrop);
      }
    };
  }, [
    instance,
    showSelectFile,
    mutationUpload,
    handleUploadFile,
    setUploadingImage,
    setShowSelectFileImage,
  ]);

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
