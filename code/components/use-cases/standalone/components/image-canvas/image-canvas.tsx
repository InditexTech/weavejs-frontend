// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ScaleLoader } from "react-spinners";
import { useQuery } from "@tanstack/react-query";
import { useStandaloneUseCase } from "../../store/store";
import { getStandaloneInstanceImageData } from "@/api/standalone/get-standalone-instance-image-data";
import { ImageCanvasWeave } from "./image-canvas.weave";
import { useCommentsHandler } from "../../hooks/use-comments-handler";

export const ImageCanvas = () => {
  useCommentsHandler();

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );

  const { data: roomData, isFetching } = useQuery({
    queryKey: ["standaloneInstanceData", instanceId, managingImageId],
    queryFn: () => {
      if (!managingImageId) {
        throw new Error("Image ID is required to fetch room data");
      }
      return getStandaloneInstanceImageData(instanceId, managingImageId);
    },
    initialData: undefined,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: managingImageId !== null,
  });

  const data = React.useMemo(() => {
    if (!roomData) {
      return undefined;
    }
    return roomData.data;
  }, [roomData]);

  if (isFetching) {
    return (
      <div className="w-full max-w-[400px] h-full flex flex-col gap-1 justify-center items-center">
        <ScaleLoader />
        <div className="font-inter text-xl uppercase">loading image...</div>
      </div>
    );
  }

  return <ImageCanvasWeave data={data} />;
};
