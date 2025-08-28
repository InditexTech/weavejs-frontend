// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { postImage as postImageV2 } from "@/api/v2/post-image";
import { useWeave } from "@inditextech/weave-react";
import {
  ImageInfo,
  type ImagesToolActionTriggerParams,
} from "@/components/actions/images-tool/types";

export function UploadFiles() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const showSelectFiles = useCollaborationRoom(
    (state) => state.images.showSelectFiles
  );
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );
  const setShowSelectFilesImages = useCollaborationRoom(
    (state) => state.setShowSelectFilesImages
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
  );

  const queryClient = useQueryClient();

  const mutationUploadMulti = useMutation({
    mutationFn: async (files: FileList) => {
      let promises = [];
      if (workloadsEnabled) {
        promises = Array.from(files).map((file) =>
          postImageV2(room ?? "", file)
        );
      } else {
        promises = Array.from(files).map((file) => postImage(room ?? "", file));
      }
      return await Promise.allSettled(promises);
    },
  });

  const handleUploadFiles = React.useCallback(
    async (files: FileList) => {
      setUploadingImage(true);
      mutationUploadMulti.mutate(files, {
        onSuccess: (data) => {
          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });

          const images: ImageInfo[] = [];
          for (const uploadInfo of data) {
            if (uploadInfo.status === "fulfilled") {
              const room = uploadInfo.value.fileName.split("/")[0];
              const imageId = uploadInfo.value.fileName.split("/")[1];
              images.push({
                imageId,
                url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`,
              });
            }
          }

          if (instance && images.length > 0) {
            instance.triggerAction<ImagesToolActionTriggerParams, void>(
              "imagesTool",
              {
                images,
                padding: 20,
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any;
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
    [instance, queryClient, room, mutationUploadMulti, setUploadingImage]
  );

  React.useEffect(() => {
    if (showSelectFiles && inputFileRef.current) {
      inputFileRef.current.addEventListener("cancel", () => {
        instance?.cancelAction("imageTool");
      });
      inputFileRef.current.click();
      setShowSelectFilesImages(false);
    }
  }, [instance, showSelectFiles, setShowSelectFilesImages]);

  return (
    <input
      type="file"
      accept="image/png,image/jpeg"
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
          handleUploadFiles(files);
        }
      }}
    />
  );
}
