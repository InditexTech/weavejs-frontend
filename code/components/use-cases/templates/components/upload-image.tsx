// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWeave } from "@inditextech/weave-react";
import { useTemplatesUseCase } from "../store/store";
import { postTemplatesImage } from "@/api/templates/post-templates-image";
import Konva from "konva";

export function UploadImage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const showSelectFile = useTemplatesUseCase(
    (state) => state.images.showSelectFile,
  );
  const setUploadingImage = useTemplatesUseCase(
    (state) => state.setUploadingImage,
  );
  const setShowSelectFileImage = useTemplatesUseCase(
    (state) => state.setShowSelectFileImage,
  );

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postTemplatesImage(instanceId, file);
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

            const queryKey = ["getTemplatesImages", instanceId];
            queryClient.invalidateQueries({ queryKey });

            if (!instance) {
              return;
            }

            inputFileRef.current.value = null;
            const room = data.image.roomId;
            const imageId = data.image.imageId;

            finishUploadCallback?.(
              nodeId,
              `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
            );
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
    [instance, instanceId, mutationUpload, queryClient, setUploadingImage],
  );

  React.useEffect(() => {
    if (showSelectFile && inputFileRef.current) {
      inputFileRef.current.click();
      setShowSelectFileImage(false);
    }
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
