// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useStandaloneUseCase } from "../../store/store";
import { getStandaloneInstanceImageData } from "@/api/standalone/get-standalone-instance-image-data";
import { ImageCanvasWeave } from "./image-canvas.weave";
import { useCommentsHandler } from "../../hooks/use-comments-handler";
import { LoaderCircle } from "lucide-react";

export const ImageCanvas = () => {
  useCommentsHandler();

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );
  const setInstanceLoading = useStandaloneUseCase(
    (state) => state.setInstanceLoading,
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

  React.useEffect(() => {
    setInstanceLoading(isFetching);
  }, [isFetching, setInstanceLoading]);

  const data = React.useMemo(() => {
    if (!roomData) {
      return undefined;
    }
    return roomData.data;
  }, [roomData]);

  if (isFetching) {
    return (
      <div className="w-full max-w-[400px] h-full flex flex-col gap-1 justify-center items-center">
        <LoaderCircle strokeWidth={1} size={48} className="animate-spin" />
        <div className="w-full flex flex-col font-light text-lg justify-center items-center text-[#757575]">
          LOADING IMAGE
        </div>
      </div>
    );
  }

  return <ImageCanvasWeave data={data} />;
};
