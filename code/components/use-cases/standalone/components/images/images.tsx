// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ImageUpIcon, Plus } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getStandaloneImages } from "@/api/standalone/get-standalone-images";
import { useStandaloneUseCase } from "../../store/store";
import { UploadImage } from "../upload-image";
import { cn } from "@/lib/utils";
import { useCollaborationRoom } from "@/store/store";
import * as ScrollArea from "@radix-ui/react-scroll-area";

export const Images = () => {
  const roomId = useCollaborationRoom((state) => state.room);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );
  const setManagingImageId = useStandaloneUseCase(
    (state) => state.setManagingImageId,
  );
  const setManagingImageSize = useStandaloneUseCase(
    (state) => state.setManagingImageSize,
  );
  const setCommentsShow = useStandaloneUseCase(
    (state) => state.setCommentsShow,
  );
  const setShowSelectFileImage = useStandaloneUseCase(
    (state) => state.setShowSelectFileImage,
  );
  const setSidebarVisible = useStandaloneUseCase(
    (state) => state.setSidebarVisible,
  );

  const { data, isFetching, isFetched } = useInfiniteQuery({
    queryKey: ["getStandaloneImages", roomId ?? ""],
    queryFn: async ({ pageParam }) => {
      return await getStandaloneImages(
        roomId ?? "",
        20,
        pageParam as unknown as string,
      );
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.continuationToken;
    },
  });

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const images = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data.pages.flatMap((page) => page.images);
  }, [data]);

  return (
    <>
      <div className="w-full h-full flex flex-col gap-5 overflow-y-auto">
        {isFetching && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
              <div className="font-inter text-xl uppercase">loading</div>
            </div>
          </div>
        )}
        {isFetched && !isFetching && images.length > 0 && (
          <ScrollArea.Root className="w-full h-[calc(100%)] overflow-hidden">
            <ScrollArea.Viewport className="@container h-full">
              <div className="w-full grid grid-rows-1 grid-cols-1 @min-[800px]:grid-cols-3 @min-[1200px]:grid-cols-4 @min-[1600px]:grid-cols-6 gap-5 p-5">
                <div className="w-full h-full flex flex-col gap-2">
                  <button
                    className="aspect-video w-full h-full border-[0.5px] border-[#c9c9c9] rounded-lg overflow-hidden flex justify-center items-center hover:bg-black/5 transition-colors cursor-pointer"
                    onClick={() => {
                      setShowSelectFileImage(true);
                    }}
                  >
                    <Plus strokeWidth={1} size={40} />
                  </button>
                </div>
                {images.map((image) => (
                  <div
                    key={image}
                    role="button"
                    className={cn(
                      "group relative w-full p-0 cursor-default rounded-lg border-[0.5px] border-[#c9c9c9] overflow-hidden",
                      {
                        ["cursor-pointer"]: !managingImageId,
                      },
                    )}
                    onClick={
                      !managingImageId
                        ? () => {
                            const img = new Image();
                            img.onload = () => {
                              setSidebarVisible(false);
                              setManagingImageSize(img.width, img.height);
                              setManagingImageId(image);
                              setCommentsShow(true);
                            };
                            img.src = `${apiEndpoint}/weavejs/standalone/${roomId}/images/${image}`;
                          }
                        : undefined
                    }
                  >
                    <img
                      className="w-full h-full aspect-video object-cover"
                      src={`${apiEndpoint}/weavejs/standalone/${roomId}/images/${image}`}
                      alt={`image ${image} thumbnail`}
                    />{" "}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                ))}
              </div>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar orientation="vertical" />
          </ScrollArea.Root>
        )}
        {isFetched && !isFetching && images.length === 0 && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full p-5 flex flex-col gap-2 justify-center items-center">
              <div className="w-full h-full flex flex-col gap-8 justify-center items-center">
                <div className="flex flex-col gap-2 justify-center items-center">
                  <ImageUpIcon size={48} strokeWidth={1} />
                  <div className="font-light text-center">
                    To start, upload an image
                  </div>
                </div>
                <button
                  className="group cursor-pointer bg-black text-white disabled:cursor-default hover:disabled:bg-transparent px-3 h-[40px] hover:text-[#c9c9c9] flex gap-3 justify-center items-center"
                  onClick={() => {
                    setShowSelectFileImage(true);
                  }}
                >
                  UPLOAD IMAGE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <UploadImage />
    </>
  );
};
