// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWeave } from "@inditextech/weave-react";
import { useTemplatesUseCase } from "../store/store";
import { postTemplatesImage } from "@/api/templates/post-templates-image";

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
    (file: File) => {
      setUploadingImage(true);
      mutationUpload.mutate(file, {
        onSuccess: () => {
          const queryKey = ["getTemplatesImages", instanceId];
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
    [instanceId, mutationUpload, queryClient, setUploadingImage],
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
