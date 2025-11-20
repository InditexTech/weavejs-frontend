// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
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
    (state) => state.images.showSelectFile
  );
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );
  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
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
      setUploadingImage(true);
      mutationUpload.mutate(file, {
        onSuccess: (data) => {
          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });

          if (!instance) {
            return;
          }

          if (!workloadsEnabled) {
            inputFileRef.current.value = null;
            const room = data.fileName.split("/")[0];
            const imageId = data.fileName.split("/")[1];

            if (position) {
              instance.triggerAction(
                "imageTool",
                {
                  imageId,
                  imageURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
                  position,
                  forceMainContainer: true,
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any;
            } else {
              const { finishUploadCallback } = instance.triggerAction(
                "imageTool"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any;

              instance.updatePropsAction("imageTool", {
                imageId,
              });

              finishUploadCallback?.({
                imageURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
              });
            }
          }

          if (workloadsEnabled) {
            inputFileRef.current.value = null;
            const room = data.image.roomId;
            const imageId = data.image.imageId;

            if (position) {
              instance.triggerAction(
                "imageTool",
                {
                  imageId,
                  imageURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
                  position,
                  forceMainContainer: true,
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any;
            } else {
              const { finishUploadCallback } = instance.triggerAction(
                "imageTool"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any;

              instance.updatePropsAction("imageTool", {
                imageId,
              });

              finishUploadCallback?.(
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
              );
            }
          }
        },
        onError: (ex) => {
          console.error(ex);
          console.error("Error uploading image");
        },
        onSettled: () => {
          setUploadingImage(false);
        },
      });
    },
    [
      instance,
      room,
      workloadsEnabled,
      mutationUpload,
      queryClient,
      setUploadingImage,
    ]
  );

  React.useEffect(() => {
    const onStageDrop = (e: DragEvent) => {
      if (!instance) {
        return;
      }

      if (window.weaveDragImageURL) {
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
      accept="image/png,image/jpeg"
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
