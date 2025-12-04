// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWeave } from "@inditextech/weave-react";
import { useStandaloneUseCase } from "../store/store";
import { postStandaloneImage } from "@/api/standalone/post-standalone-image";

export function UploadImage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const showSelectFile = useStandaloneUseCase(
    (state) => state.images.showSelectFile
  );
  const setUploadingImage = useStandaloneUseCase(
    (state) => state.setUploadingImage
  );
  const setShowSelectFileImage = useStandaloneUseCase(
    (state) => state.setShowSelectFileImage
  );

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postStandaloneImage(instanceId, file);
    },
  });

  const handleUploadFile = React.useCallback(
    (file: File) => {
      setUploadingImage(true);
      mutationUpload.mutate(file, {
        onSuccess: () => {
          const queryKey = ["getStandaloneImages", instanceId];
          queryClient.invalidateQueries({ queryKey });
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
    [instanceId, mutationUpload, queryClient, setUploadingImage]
  );

  React.useEffect(() => {
    if (showSelectFile && inputFileRef.current) {
      inputFileRef.current.addEventListener("cancel", () => {
        instance?.cancelAction("imageTool");
      });
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
