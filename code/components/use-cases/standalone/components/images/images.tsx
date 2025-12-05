// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ImagesIcon, ImageUpIcon, PencilIcon } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getStandaloneImages } from "@/api/standalone/get-standalone-images";
import { useStandaloneUseCase } from "../../store/store";
import { UploadImage } from "../upload-image";
import { cn } from "@/lib/utils";
import { ScaleLoader } from "react-spinners";

export const Images = () => {
  const instanceId = useStandaloneUseCase((state) => state.instanceId);

  const saving = useStandaloneUseCase((state) => state.actions.saving);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const setShowSelectFileImage = useStandaloneUseCase(
    (state) => state.setShowSelectFileImage
  );
  const setManagingImageId = useStandaloneUseCase(
    (state) => state.setManagingImageId
  );
  const setManagingImageSize = useStandaloneUseCase(
    (state) => state.setManagingImageSize
  );
  const setCommentsShow = useStandaloneUseCase(
    (state) => state.setCommentsShow
  );

  const { data, isFetching, isFetched } = useInfiniteQuery({
    queryKey: ["getStandaloneImages", instanceId],
    queryFn: async ({ pageParam }) => {
      return await getStandaloneImages(
        instanceId,
        20,
        pageParam as unknown as string
      );
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.continuationToken;
    },
  });

  const images = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data.pages.flatMap((page) => page.images);
  }, [data]);

  return (
    <>
      <div className="w-full p-5 py-3 border-b border-[#c9c9c9] flex justify-between items-center">
        <div className="font-inter text-lg">Images</div>
        <div className="flex gap-1 justify-end items-center">
          <button
            disabled={saving}
            className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent w-[20px] h-[40px] hover:text-[#c9c9c9]"
            onClick={() => {
              setShowSelectFileImage(true);
            }}
          >
            <ImageUpIcon size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
      <div className="w-full h-[calc(100dvh-65px-65px)] flex flex-col gap-5 justify-start items-center overflow-y-auto">
        {isFetching && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
              <ScaleLoader />
              <div className="font-inter text-xl">loading</div>
            </div>
          </div>
        )}
        {isFetched &&
          !isFetching &&
          images.length > 0 &&
          images.map((image, index) => (
            <div
              key={image}
              className={cn("relative w-full px-5", {
                ["mb-5"]: index === images.length - 1,
                ["mt-5"]: index === 0,
              })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full aspect-video object-cover border border-[#c9c9c9]"
                src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/standalone/${instanceId}/images/${image}`}
                alt={`image ${image} thumbnail`}
              />
              {!managingImageId && (
                <div className="absolute bottom-5 right-8">
                  <button
                    className="group cursor-pointer bg-white disabled:cursor-default hover:disabled:bg-transparent px-3 h-[40px] hover:text-[#c9c9c9] flex gap-3 justify-center items-center"
                    onClick={() => {
                      const img = new Image();
                      img.onload = () => {
                        setManagingImageSize(img.width, img.height);
                        setManagingImageId(image);
                        setCommentsShow(true);
                      };
                      img.src = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/standalone/${instanceId}/images/${image}`;
                    }}
                  >
                    <PencilIcon strokeWidth={1} size={16} /> MANAGE
                  </button>
                </div>
              )}
            </div>
          ))}
        {isFetched && !isFetching && images.length === 0 && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="w-full p-5 flex flex-col gap-2 justify-center items-center">
              <ImagesIcon strokeWidth={1} size={32} />
              <div className="font-inter text-sm">No images loaded</div>
            </div>
          </div>
        )}
      </div>
      <UploadImage />
    </>
  );
};
