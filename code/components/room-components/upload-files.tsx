// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useMutation } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";
import { useWeave } from "@inditextech/weave-react";
import { type ImagesToolActionTriggerParams } from "@/components/actions/images-tool/types";

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

  const mutationUploadMulti = useMutation({
    mutationFn: async (files: FileList) => {
      const promises = Array.from(files).map((file) =>
        postImage(room ?? "", file)
      );
      return await Promise.allSettled(promises);
    },
  });

  const handleUploadFiles = React.useCallback(
    async (files: FileList) => {
      setUploadingImage(true);
      mutationUploadMulti.mutate(files, {
        onSuccess: (data) => {
          const imagesURLs = [];
          for (const uploadInfo of data) {
            if (uploadInfo.status === "fulfilled") {
              const room = uploadInfo.value.fileName.split("/")[0];
              const imageId = uploadInfo.value.fileName.split("/")[1];
              imagesURLs.push(
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
              );
            }
          }

          if (instance && imagesURLs.length > 0) {
            instance.triggerAction<ImagesToolActionTriggerParams>(
              "imagesTool",
              {
                imagesURLs,
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
    [instance, mutationUploadMulti, setUploadingImage]
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
