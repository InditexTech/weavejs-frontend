// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { useWeave } from "@inditextech/weave-react";

export function UploadFile() {
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

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  const handleUploadFile = React.useCallback(
    (file: File) => {
      setUploadingImage(true);
      mutationUpload.mutate(file, {
        onSuccess: (data) => {
          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });

          if (instance) {
            inputFileRef.current.value = null;
            const room = data.fileName.split("/")[0];
            const imageId = data.fileName.split("/")[1];

            const { finishUploadCallback } = instance.triggerAction(
              "imageTool"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any;

            instance.updatePropsAction("imageTool", { imageId });

            finishUploadCallback?.(
              `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
            );
          }
        },
        onError: () => {
          console.error("Error uploading image");
        },
        onSettled: () => {
          setUploadingImage(false);
        },
      });
    },
    [instance, room, mutationUpload, queryClient, setUploadingImage]
  );

  React.useEffect(() => {
    const onStageDrop = (e: DragEvent) => {
      if (window.weaveDragImageURL) {
        return;
      }

      if (e.dataTransfer?.items) {
        [...e.dataTransfer?.items].forEach((item) => {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) {
              handleUploadFile(file);
            }
          }
        });
        return;
      }
      if (e.dataTransfer?.files) {
        [...e.dataTransfer.files].forEach((file) => {
          handleUploadFile(file);
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
